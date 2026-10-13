import { useOnline } from '../hooks/useOnline';
import { isRemoteNight, waitingCount } from '../services/door';
import { listTime } from '../services/doorList';
import { meta } from '../ui/helpers';

/* One line on the door and the scanner (spec 6.14): where scans are checked, and what's still waiting to send.
   Online: "Guest list on this phone · updated 9:41 pm". Offline: "Offline · checking passes against the list on this
   phone · 2 waiting to send" */
export function DoorListLine(p) {
  var id = p.id;
  var online = useOnline();
  if (!id || !isRemoteNight(id)) return null;
  var at = listTime(id),
    waiting = waitingCount(),
    when = at ? new Date(at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : null,
    tail = waiting ? ' · ' + waiting + ' waiting to send' : '';
  if (!online)
    return meta(at ? 'Offline · checking passes against the list on this phone' + tail : 'Offline · no guest list on this phone yet');
  return meta(at ? 'Guest list on this phone · updated ' + when + tail : 'Downloading the guest list' + tail);
}
