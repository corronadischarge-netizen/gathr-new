import { CFG } from '../config';

/* Promoter invites travel as a link (once gathr is hosted) and always as a code someone can type into the app. */

/* the link that opens the invite, or '' while gathr has no public web address */
export function inviteLink(code) {
  return CFG.publicUrl ? CFG.publicUrl.replace(/\/?$/, '/') + '#pi=' + encodeURIComponent(code) : '';
}

/* a code typed or pasted by hand: "kuk 7q4m2x", "KUK-7Q4M2X" or a whole link all become KUK-7Q4M2X */
export function cleanCode(s) {
  var m = /#pi=([^&\s]+)/.exec(s || '');
  var x = (m ? decodeURIComponent(m[1]) : s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return x.length === 9 ? x.slice(0, 3) + '-' + x.slice(3) : x;
}

/* what the host sends: who, what, when, what's in it for them, then how to accept */
export function inviteMessage(o) {
  var link = inviteLink(o.code);
  return {
    text:
      o.host +
      ' invited you to promote ' +
      o.title +
      ' on gathr · ' +
      o.when +
      '. You get your own guest list' +
      (o.cap ? ' for up to ' + o.cap + ' people' : '') +
      '. ' +
      (link
        ? 'Accept here (or enter code ' + o.code + ' in gathr):'
        : 'To accept, open gathr, go to You › Promoter invite and enter ' + o.code + '.'),
    link: link
  };
}
