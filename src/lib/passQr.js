import { EVENTS } from '../data/listings';
import { orgStats } from '../data/organisers';

/* the QR on a pass: event, booking code, passes and a checksum, so typos and made-up codes are rejected.
     A real launch signs this on the server (Supabase) so it can't be forged from the app's code. */
function chk(str) {
  var n = 5381;
  for (var i = 0; i < str.length; i++) n = ((n * 33) ^ str.charCodeAt(i)) >>> 0;
  return n.toString(36).slice(-5);
}

export function passPayload(eid, code, passes) {
  var body = 'G1.' + eid + '.' + code + '.' + passes;
  return body + '.' + chk(body + '|gathr-door');
}

function parsePass(txt) {
  var t = String(txt || '').trim(),
    m = /^G1\.([A-Za-z0-9_]+)\.(G-[A-Z0-9]+)\.(\d+)\.([a-z0-9]+)$/.exec(t);
  if (!m) return null;
  if (chk('G1.' + m[1] + '.' + m[2] + '.' + m[3] + '|gathr-door') !== m[4]) return { bad: true };
  return { eid: m[1], code: m[2], passes: +m[3] };
}

/* what a scanned or typed pass means for this night */
export function checkPass(S, id, raw) {
  var e = EVENTS[id],
    st = orgStats(S, id),
    code,
    passes = null,
    eid = id;
  if (/^code:/.test(raw)) {
    code = raw.slice(5);
  } else {
    var pp = parsePass(raw);
    if (!pp)
      return {
        tone: 'red',
        title: 'Not a gathr pass',
        line: 'This QR code isn’t a gathr pass. Ask for the pass in the gathr app.'
      };
    if (pp.bad)
      return {
        tone: 'red',
        title: 'This pass has been changed',
        line: 'The code doesn’t check out. Ask the guest to open the pass again in the app.'
      };
    code = pp.code;
    passes = pp.passes;
    eid = pp.eid;
  }
  if (eid !== id) {
    var o = EVENTS[eid];
    return {
      tone: 'red',
      title: 'Wrong night',
      line: o ? 'This pass is for ' + o.title + ' on ' + o.date + '.' : 'This pass is for a different night.'
    };
  }
  var g = st.guests.filter((x) => x.code === code)[0];
  if (g && st.ci[g.name])
    return {
      tone: 'amber',
      title: 'Already in',
      line:
        g.name +
        ' · ' +
        g.passes +
        (g.passes === 1 ? ' pass' : ' passes') +
        (st.ci[g.name] > 1
          ? ' · scanned at ' +
            new Date(st.ci[g.name]).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
          : ''),
      guest: g,
      undo: true
    };
  if (g)
    return {
      tone: 'green',
      title: g.name,
      line:
        g.passes +
        (g.passes === 1 ? ' pass' : ' passes') +
        ' · ' +
        (e.allAges ? 'all-ages night' : (e.age || 18) + '+ night · check their ID'),
      guest: g,
      admit: true
    };
  if (passes)
    return {
      tone: 'amber',
      title: 'Valid pass, not on this phone’s list',
      line:
        'Booking ' +
        code +
        ' · ' +
        passes +
        (passes === 1 ? ' pass' : ' passes') +
        '. Lists sync across phones once gathr is online.',
      walkin: { name: 'Guest ' + code, passes: passes, code: code, booked: 'Scanned at the door' },
      admit: true
    };
  return {
    tone: 'red',
    title: 'No booking with that code',
    line: 'Check the code on the guest’s pass, or find them in Guests.'
  };
}
