import { ModeSwitchCard } from '../cards/ModeSwitchCard';
import { StatusCard } from '../cards/StatusCard';
import { VENUES } from '../data/listings';
import { AREA_LIST } from '../data/options';
import { REC, levelOf, nightsCount } from '../data/sample';
import { Button } from '../design-system';
import { eyebrow, icon, meAvatar, meta, note, sec, statusChip, stop, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* You: status, perks, record, credit */
export function You(p) {
  var c = p.ctx,
    S = c.S,
    lv = levelOf(nightsCount(S));
  /* settings rows: [title, current value, on tap, [3D icon, colour]] */
  var rows = [
    [
      'Your nights',
      Object.keys(S.nights)
        .filter((k) => AREA_LIST.indexOf(k) < 0)
        .join(', ') || 'Tune your week',
      () => c.go('vibe'),
      ['discoball', 'violet']
    ],
    [
      'Where you go out',
      Object.keys(S.nights)
        .filter((k) => AREA_LIST.indexOf(k) >= 0)
        .join(', ') || 'Pick areas or use your location',
      () => c.go('areas'),
      ['sunglasses', 'pink']
    ],
    ['Age', S.age || 'Asked when a night needs it', () => c.go('editprofile'), ['pass', 'blue']],
    [
      'Friends',
      (S.ishaan === 'yes' ? '5 friends' : '4 friends') + (!S.ishaan ? ' · 1 request' : ''),
      () => c.go('friendslist'),
      ['heart', 'pink']
    ],
    [
      'Following',
      Object.keys(S.follow).join(', ') || 'No artists or venues yet',
      () => c.tab('search'),
      ['headphones', 'yellow']
    ],
    [
      'Host a night',
      S.org && S.org.profile
        ? 'Switch to hosting · ' + S.org.profile.name
        : 'List free · see your guestlist and turn-ups',
      () => {
        if (S.org && S.org.profile) c.toHost();
        else c.go('orgintro');
      },
      ['spotlight', 'red']
    ]
  ];
  // gathr admins (and only them) get a way in to approvals
  if (S.isAdmin)
    rows.unshift([
      'gathr admin',
      'Verify organisers and put nights live',
      () => c.go('admin'),
      ['megaphone', 'violet']
    ]);
  return (
    <div className="px col" style={{ padding: '52px 16px 140px', gap: '26px' }}>
      <div className="rowc" style={{ gap: '16px' }}>
        <Tap onClick={() => c.go('editprofile')} className="tap me-head" aria-label="Edit profile photo">
          {meAvatar(S, 72)}
          <span className="avatar-badge sm">{icon('image', 14)}</span>
        </Tap>
        <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
          {eyebrow((S.me.handle ? '@' + S.me.handle + ' · ' : '') + lv[0])}
          {stop((S.me.name ? S.me.name.split(' ')[0] : 'you').toLowerCase(), 'sm')}
          {S.signedIn ? (
            meta(S.email || 'Signed in')
          ) : (
            <button
              type="button"
              className="link-btn"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => c.go('phone', { login: false })}
            >
              Sign in to save your plans{icon('chevron-right', 16)}
            </button>
          )}
          {S.me.bio ? meta(S.me.bio) : null}
        </div>
        <Button variant="subtle" size="sm" onClick={() => c.go('editprofile')}>
          Edit
        </Button>
      </div>
      {S.org && S.org.profile ? <ModeSwitchCard ctx={c} /> : null}
      <StatusCard ctx={c} />
      <div className="col" style={{ gap: '4px' }}>
        {sec(
          'Your nights out',
          <button type="button" className="link-btn" onClick={() => c.go('wrapped')}>
            Your month, wrapped{icon('chevron-right', 16)}
          </button>
        )}
        {REC.slice(0, 4).map((r) => {
          var v = VENUES[r[0]];
          return (
            <div key={r[1] + r[2]} className="rowc list-row" style={{ gap: '14px' }}>
              {tile(v.ic, 'violet', 44)}
              <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                <span className="title15">{r[1]}</span>
                {meta(v.name + ' · ' + r[2] + ' · with ' + r[3])}
              </div>
              {statusChip('Checked in', 'ok')}
            </div>
          );
        })}
        {note('Past nights are sample data.')}
      </div>
      <div className="col">
        {rows.map((r) => (
          <Tap onClick={r[2]} key={r[0]} className="tap rowc list-row" style={{ gap: '14px' }}>
            {tile(r[3][0], r[3][1], 44)}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{r[0]}</span>
              {meta(r[1])}
            </div>
            {icon('chevron-right')}
          </Tap>
        ))}
      </div>
      {S.signedIn ? (
        <Button variant="subtle" block onClick={() => c.set({ sheet: 'logout' })}>
          Log out
        </Button>
      ) : null}
    </div>
  );
}
