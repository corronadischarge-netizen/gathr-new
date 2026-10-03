import { i3, icon, meta } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* This week: invite to list a night. Opens hosting mode, or the organiser intro the first time. */
export function HostCtaCard(p) {
  var c = p.ctx,
    S = c.S;
  return (
    <Tap
      onClick={() => {
        if (S.org && S.org.profile) c.toHost();
        else c.go('orgintro');
      }}
      className="tap tune-card rowc"
      aria-label="Host a night on gathr"
    >
      {i3('spotlight', 52)}
      <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
        <span className="title15">Hosting a night in Pune?</span>
        {meta('List it free. See your guestlist and who turns up.')}
      </div>
      {icon('chevron-right')}
    </Tap>
  );
}
