import { HowFriendsWorkCard } from '../cards/HowFriendsWorkCard';
import { Switch } from '../components/Switch';
import { APP_URL } from '../config';
import { friendRequest, friendsOf } from '../data/friends';
import { Button, IconButton } from '../design-system';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { eyebrow, fav, i3, meta, note, sec, stop } from '../ui/helpers';

/* Friends: how they're added, what they can see */
export function FriendsList(p) {
  var c = p.ctx,
    S = c.S;
  var list = friendsOf(S).map((f) => [f.name, f.from, f.together, f.photo]),
    req = friendRequest(S);
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div className="rel">
        {i3('heart', 88, 'head-ic bob')}
        {eyebrow('Only people you both added')}
        {stop('your friends')}
      </div>
      <HowFriendsWorkCard />
      <div className="rowc" style={{ gap: '12px', minHeight: '56px' }}>
        <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
          <span className="title15">Show my booked nights to friends</span>
          {meta(
            S.shareNights ? 'Friends see when you’re going somewhere' : 'You’re hidden from "friends going"'
          )}
        </div>
        <Switch
          on={S.shareNights}
          label="Show my booked nights to friends"
          onClick={() => c.set({ shareNights: !S.shareNights })}
        />
      </div>
      {req ? (
        <div className="col" style={{ gap: '10px' }}>
          <span className="g-section-title">Request</span>
          <div className="rowc" style={{ gap: '12px' }}>
            {fav(req.name, 44, req.photo)}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{req.name}</span>
              {meta('Wants to add you as a friend')}
            </div>
            <Button variant="ghost" size="sm" onClick={() => c.set({ friendReq: 'no' })}>
              Ignore
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                c.set({ friendReq: 'yes' });
                c.toast('You and ' + req.name + ' are now friends');
              }}
            >
              Accept
            </Button>
          </div>
        </div>
      ) : null}
      <div className="col" style={{ gap: '4px' }}>
        {sec('Friends', meta(list.length + ''))}
        {list.map((f) => (
          <div key={f[0]} className="rowc list-row" style={{ gap: '12px' }}>
            {fav(f[0], 44, f[3])}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{f[0]}</span>
              {meta(f[1] + ' · ' + f[2])}
            </div>
          </div>
        ))}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <Button
          variant="primary"
          size="lg"
          block
          icon="users"
          onClick={() => {
            if (!Share.contactsSupported) {
              Share.link(
                'gathr',
                'Join me on gathr. See who gets in, vote on plans, go out together.',
                APP_URL
              ).then((r) => {
                var t = shareToast(r, 'Invite link');
                if (t) c.toast(t);
              });
              return;
            }
            Share.pickContacts().then(
              (list) => {
                if (!list || !list.length) return;
                var names = list.map((x) => (x.name && x.name[0]) || 'a friend');
                Share.whatsapp('Join me on gathr: ' + APP_URL);
                c.toast(
                  'Invite ready for ' +
                    names.slice(0, 2).join(', ') +
                    (names.length > 2 ? ' and ' + (names.length - 2) + ' more' : '')
                );
              },
              () => {}
            );
          }}
        >
          {Share.contactsSupported ? 'Find friends from contacts' : 'Invite friends'}
        </Button>
        <Button
          variant="subtle"
          block
          icon="share"
          onClick={() =>
            Share.link(
              'gathr',
              'Add me on gathr' + (S.me.handle ? ' (@' + S.me.handle + ')' : '') + '.',
              APP_URL
            ).then((r) => {
              var t = shareToast(r, 'Invite link');
              if (t) c.toast(t);
            })
          }
        >
          Share your invite link
        </Button>
      </div>
      {S.demo ? note('Friends are sample data') : null}
    </div>
  );
}
