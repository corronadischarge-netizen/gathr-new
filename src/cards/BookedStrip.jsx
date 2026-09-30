import { i3, icon, meta } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* This week: "you're on the list" reminder for your booked night */
export function BookedStrip(p) {
  var c = p.ctx;
  return (
    <Tap onClick={() => c.go('ready')} className="tap g-card card rowc booked-strip" style={{ gap: '12px' }}>
      {i3('wristband', 40)}
      <div className="col" style={{ flexGrow: 1, gap: '2px' }}>
        <span className="title16">{c.plan.title}</span>
        {meta("You're on the list · " + c.plan.date)}
      </div>
      {icon('chevron-right')}
    </Tap>
  );
}
