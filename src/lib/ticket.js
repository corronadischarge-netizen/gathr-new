import { VENUES } from '../data/listings';
import { passCode } from '../data/sample';
import { passPayload } from './passQr';

/* "Thu 1 Oct" → day "Thu", date "01.10", the ticket's pill row */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function ticketWhen(s) {
  var m = /^(\w{3}) (\d{1,2}) (\w{3})$/.exec(s || ''),
    mo = m ? MONTHS.indexOf(m[3]) : -1;
  if (mo < 0) return { date: s };
  return { day: m[1], date: m[2].padStart(2, '0') + '.' + String(mo + 1).padStart(2, '0') };
}

/* a booked night as Ticket props: only the minimum (name, day and date, time, venue, the entry code).
   The venue gives the hue and the vibe tag; the stub carries the booking code door staff can type */
export function ticketProps(S, e, passes) {
  var v = VENUES[e.venue],
    code = passCode(S, e),
    when = ticketWhen(e.date);
  passes = passes || 1;
  return {
    hue: v.hue,
    kicker: v.vibe,
    name: e.title,
    day: when.day,
    date: when.date,
    time: e.time,
    venue: v.name,
    code: passPayload(e.id, code, passes),
    number: code,
    admit: passes > 1 ? 'Admit ' + passes : 'Admit one'
  };
}
