import { orgSave } from '../data/organisers';
import { Wordmark } from '../design-system';
import { TABS } from '../navigation';

/* hosting and organiser shortcuts: [stack, mode, needs an organiser profile] */
const HOSTING = {
  orgintro: [['you', 'orgintro'], 'guest', false],
  orgsetup: [['you', 'orgsetup'], 'guest', false],
  orghome: [['orghome'], 'host', true],
  orgform: [['orghome', 'orgform'], 'host', true],
  hostdoor: [['hostdoor'], 'host', true],
  scanner: [['hostdoor'], 'host', true],
  hostguests: [['hostguests'], 'host', true],
  hostprofile: [['hostprofile'], 'host', true]
};

function jumpToHosting(c, key) {
  var h = HOSTING[key];
  /* hosting screens need an organiser: create a sample one if there isn't one yet */
  if (h[2] && !c.S.org.profile)
    orgSave(
      c,
      Object.assign({}, c.S.org, {
        profile: {
          name: 'Kukoo',
          type: 'venue',
          venueId: 'kukoo',
          venueIds: ['kukoo'],
          newVenue: null,
          insta: 'kukoo.pune',
          phone: '',
          status: 'pending',
          since: new Date().toISOString()
        }
      })
    );
  c.set({
    stack: h[0],
    mode: h[1],
    sheet: null,
    dir: h[0].length > 1 ? 'fwd' : 'tab',
    seen: true,
    orgEdit: null,
    scanning: key === 'scanner'
  });
}

export function ReviewPanel(p) {
  var c = p.ctx,
    list = [
      ['welcome', 'Welcome · 1'],
      ['welcome2', 'Welcome · 2'],
      ['welcome3', 'Welcome · 3'],
      ['tonight', 'This week'],
      ['vibe', 'Tune your week'],
      ['agecheck', 'Age check (21+ night)'],
      ['event', 'Event'],
      ['friends', 'Friends going'],
      ['list', 'Book (one sheet)'],
      ['pass', 'Pass'],
      ['newplan', 'Start a group plan'],
      ['group', 'Group plan · vote'],
      ['groupbooked', 'Group plan · booked'],
      ['ready', 'Get ready'],
      ['friendslist', 'Friends'],
      ['editprofile', 'Edit profile'],
      ['recap', 'Recap'],
      ['wrapped', 'Wrapped'],
      ['you', 'You · status'],
      ['venuedash', 'Venue view'],
      ['notifs', 'Updates'],
      ['promoinvite', 'Promoter invite'],
      ['map', 'Map'],
      ['venue', 'Venue'],
      ['search', 'Search'],
      ['plans', 'Plans'],
      ['rules', 'Who gets in'],
      ['cancel', 'Cancel booking'],
      ['login', 'Log in'],
      ['logout', 'Log out'],
      ['orgintro', 'Host · intro'],
      ['orgsetup', 'Host · organiser profile'],
      ['orghome', 'Host · your nights'],
      ['orgform', 'Host · list a night'],
      ['hostdoor', 'Host · door'],
      ['scanner', 'Host · scan a pass'],
      ['hostguests', 'Host · guests'],
      ['hostprofile', 'Host · profile']
    ];
  return (
    <nav className="jump" aria-label="Jump to a screen">
      <Wordmark size={26} />
      <p className="meta" style={{ margin: '12px 0 16px' }}>
        Tap through the phone, or jump to any screen.
      </p>
      {list.map((it) => {
        var active = c.S.sheet
          ? it[0] === c.S.sheet
          : (it[0] === p.scr && !(p.scr === 'phone' && c.S.login)) ||
            (it[0] === 'login' && p.scr === 'phone' && c.S.login);
        return (
          <button
            key={it[0]}
            type="button"
            className={'jump-btn' + (active ? ' on' : '')}
            onClick={() => {
              if (HOSTING[it[0]]) {
                jumpToHosting(c, it[0]);
                return;
              }
              /* every other screen is a going-out screen */
              if (c.S.mode === 'host') c.set({ mode: 'guest', scanning: false });
              if (it[0] === 'rules' || it[0] === 'list' || it[0] === 'poster' || it[0] === 'friends')
                c.set({
                  stack: ['tonight', 'event'],
                  cur: it[0] === 'friends' ? 'illegal' : c.S.cur,
                  sheet: it[0],
                  dir: 'fwd'
                });
              else if (it[0] === 'welcome2' || it[0] === 'welcome3')
                c.set({ stack: ['welcome'], sheet: null, wstep: it[0] === 'welcome2' ? 1 : 2 });
              else if (it[0] === 'agecheck')
                c.set({
                  stack: ['tonight', 'event'],
                  cur: 'twin',
                  age: null,
                  sheet: 'age',
                  after: null,
                  dir: 'fwd'
                });
              else if (it[0] === 'newplan')
                c.set({
                  stack: ['plans', 'newplan'],
                  draft: { opts: ['lavish'], deadline: 'Thu 6 pm', name: 'Friday plan' },
                  sheet: null,
                  dir: 'fwd'
                });
              else if (it[0] === 'groupbooked')
                c.set((o) => ({
                  stack: ['plans', 'group'],
                  gp: Object.assign({}, o.gp, { stage: 'booked', booked: 'lavish' }),
                  planned: 'lavish',
                  cur: 'lavish',
                  guests: 5,
                  sent: true,
                  onList: true,
                  sheet: null,
                  dir: 'fwd'
                }));
              else if (
                it[0] === 'vibe' ||
                it[0] === 'wrapped' ||
                it[0] === 'venuedash' ||
                it[0] === 'friendslist' ||
                it[0] === 'editprofile'
              )
                c.set({ stack: [it[0] === 'vibe' ? 'tonight' : 'you', it[0]], sheet: null, dir: 'fwd' });
              else if (it[0] === 'login')
                c.set({ stack: ['welcome', 'phone'], login: true, sheet: null, dir: 'fwd' });
              else if (it[0] === 'logout') c.set({ stack: ['you'], sheet: 'logout', dir: 'tab' });
              else if (it[0] === 'cancel')
                c.set((o) => ({
                  stack: ['plans', 'pass'],
                  planned: o.planned || o.cur,
                  sheet: 'cancel',
                  dir: 'fwd'
                }));
              else if (['vibe', 'areas', 'age', 'phone'].indexOf(it[0]) >= 0)
                c.set({
                  stack: ['welcome', 'vibe', 'areas', 'age', 'phone'].slice(
                    0,
                    ['welcome', 'vibe', 'areas', 'age', 'phone'].indexOf(it[0]) + 1
                  ),
                  login: false,
                  sheet: null,
                  dir: 'fwd'
                });
              else if (it[0] === 'venue' || it[0] === 'event')
                c.set({ stack: ['tonight', it[0]], sheet: null });
              else if (TABS.indexOf(it[0]) >= 0 || it[0] === 'welcome')
                c.set({ stack: [it[0]], sheet: null, wstep: 0 });
              else
                c.set((o) => {
                  var planned =
                    o.planned || (['pass', 'ready', 'home', 'recap'].indexOf(it[0]) >= 0 ? o.cur : null);
                  return {
                    stack: ['tonight', it[0]],
                    sheet: null,
                    planned: planned,
                    onList: !!planned,
                    cur: planned || o.cur
                  };
                });
            }}
          >
            {it[1]}
          </button>
        );
      })}
      <button type="button" className="jump-btn reset" onClick={() => location.reload()}>
        Start over
      </button>
    </nav>
  );
}
