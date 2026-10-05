import { GuestList } from '../components/GuestList';
import { HostGuestList } from '../components/HostGuestList';
import { HostBar } from '../components/HostBar';
import { NightPicker } from '../components/NightPicker';
import { hostCur, hostNights } from '../data/hostNights';
import { EVENTS } from '../data/listings';
import { OrgIntro } from './OrgIntro';
import { eyebrow, i3, meta, stop } from '../ui/helpers';

/* Guests for the night you pick: your guest list (free entry), then everyone who's coming */
export function HostGuests(p) {
  var c = p.ctx,
    S = c.S,
    list = hostNights(S),
    id = hostCur(S);
  if (!S.org.profile) return <OrgIntro ctx={c} />;
  return (
    <div className="full col pad-top" style={{ gap: '22px', paddingTop: '52px', paddingBottom: '140px' }}>
      <HostBar ctx={c} />
      <div>
        {eyebrow(id ? EVENTS[id].date + ' · ' + EVENTS[id].title : 'No nights on')}
        {stop('guests')}
      </div>
      {id ? <NightPicker ctx={c} list={list} cur={id} /> : null}
      {id ? <HostGuestList key={'gl' + id} ctx={c} id={id} /> : null}
      {id ? (
        <GuestList key={id} ctx={c} id={id} live />
      ) : (
        <div className="g-card card col empty-card">
          {i3('pass', 64)}
          <span className="title16">No one booked yet</span>
          {meta('Guests show here once a night is live and people book.')}
        </div>
      )}
    </div>
  );
}
