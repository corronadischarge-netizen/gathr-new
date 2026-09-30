import { useEffect, useRef, useState } from 'react';
import { HOST_TABS, HostTabBar } from './components/HostTabBar';
import { ReviewPanel } from './components/ReviewPanel';
import { Scanner } from './components/Scanner';
import { REVIEW } from './config';
import { EVENTS, VENUES, isPast } from './data/listings';
import { orgLoad } from './data/organisers';
import { TabBar } from './design-system';
import { store } from './lib/utils';
import { TABS } from './navigation';
import { Age } from './screens/Age';
import { Areas } from './screens/Areas';
import { EditProfile } from './screens/EditProfile';
import { EventScreen } from './screens/EventScreen';
import { FriendsList } from './screens/FriendsList';
import { Group } from './screens/Group';
import { HostDoor } from './screens/HostDoor';
import { HostGuests } from './screens/HostGuests';
import { HostProfile } from './screens/HostProfile';
import { Invite } from './screens/Invite';
import { MapScreen } from './screens/MapScreen';
import { NewPlan } from './screens/NewPlan';
import { Notifs } from './screens/Notifs';
import { OrgEvent } from './screens/OrgEvent';
import { OrgForm } from './screens/OrgForm';
import { OrgHome } from './screens/OrgHome';
import { OrgIntro } from './screens/OrgIntro';
import { OrgSetup } from './screens/OrgSetup';
import { Pass } from './screens/Pass';
import { Phone } from './screens/Phone';
import { Plans } from './screens/Plans';
import { Ready } from './screens/Ready';
import { Recap } from './screens/Recap';
import { Search } from './screens/Search';
import { Tonight } from './screens/Tonight';
import { Venue } from './screens/Venue';
import { VenueDash } from './screens/VenueDash';
import { Vibe } from './screens/Vibe';
import { Welcome } from './screens/Welcome';
import { Wrapped } from './screens/Wrapped';
import { You } from './screens/You';
import { Auth } from './services/auth';
import { Pay } from './services/payments';
import { SheetLayer } from './sheets/SheetLayer';

export function App() {
  var s0 = {
    stack: ['welcome'],
    dir: 'tab',
    login: false,
    loc: false,
    phone: '',
    code: '',
    otpSent: false,
    sheet: null,
    cur: 'illegal',
    filter: 'all',
    nights: {},
    age: null,
    guests: 2,
    onList: false,
    planned: null,
    saved: { twin: 1 },
    vote: null,
    query: '',
    sfilters: {},
    follow: {},
    share: true,
    ping: true,
    ride: false,
    rating: 'Worth it',
    mapSel: null,
    onWay: false,
    toast: null,
    wstep: 0,
    me: (() => {
      var d = { name: '', handle: '', area: '', bio: '', photo: null, upi: '' };
      try {
        var x = JSON.parse(localStorage.getItem('gathr.me') || 'null');
        if (x) d = Object.assign(d, x);
      } catch (e) {}
      return d;
    })(),
    org: orgLoad(),
    orgEdit: null,
    orgView: null,
    mode: 'guest',
    hostNight: null,
    scanning: false,
    signedIn: false,
    email: '',
    phoneOk: false,
    seen: false,
    busy: null,
    sent: false,
    shareNights: true,
    ishaan: null,
    credit: 150,
    checkedIn: false,
    after: null,
    draft: null,
    gpBook: null,
    paidSplit: false,
    gp: {
      name: 'Friday plan',
      opts: ['lavish', 'bollywood', 'resign'],
      deadline: 'Thu 6 pm',
      votes: { lavish: ['Zoya', 'Aman'], bollywood: ['Kavya'], resign: [] },
      members: ['Zoya', 'Aman', 'Kavya', 'Kabir'],
      stage: 'voting',
      booked: null
    }
  };
  /* returning visitors pick up where they left off: bookings, saves, plans, sign-in and settings live on the device */
  var PERSIST = [
    'saved',
    'planned',
    'onList',
    'guests',
    'sent',
    'gp',
    'vote',
    'follow',
    'age',
    'nights',
    'credit',
    'signedIn',
    'email',
    'phone',
    'phoneOk',
    'shareNights',
    'ishaan',
    'checkedIn',
    'seen',
    'paidSplit',
    'rating',
    'filter',
    'payId',
    'notifSeen',
    'mode',
    'hostNight'
  ];
  (() => {
    var p = store('gathr.state');
    if (p) {
      PERSIST.forEach((k) => {
        if (p[k] !== undefined) s0[k] = p[k];
      });
      if (s0.planned && (!EVENTS[s0.planned] || isPast(EVENTS[s0.planned]))) {
        s0.planned = null;
        s0.onList = false;
      }
      if (s0.seen) s0.stack = ['tonight'];
    }
    if (s0.mode === 'host' && s0.org && s0.org.profile && s0.seen) s0.stack = ['hostdoor'];
    else s0.mode = 'guest';
    var m = /#(e|plan)=([^&]+)(.*)$/.exec(location.hash);
    if (m) s0.mode = 'guest';
    if (m && m[1] === 'e' && EVENTS[decodeURIComponent(m[2])]) {
      s0.stack = ['tonight', 'event'];
      s0.cur = decodeURIComponent(m[2]);
      s0.dir = 'fwd';
      s0.seen = true;
      if (EVENTS[s0.cur].age >= 21 && !s0.age) s0.sheet = 'age';
    }
    if (m && m[1] === 'plan') {
      var ids = decodeURIComponent(m[2])
        .split(',')
        .filter((k) => EVENTS[k]);
      var q = {};
      (m[3] || '').replace(/[&]([a-z]+)=([^&]*)/g, (_, a, b) => {
        q[a] = decodeURIComponent(b);
      });
      if (ids.length) {
        s0.invite = { opts: ids, name: q.n || 'Night out', by: q.by || 'A friend', deadline: q.d || '' };
        s0.stack = ['tonight', 'invite'];
        s0.seen = true;
      }
    }
    if (m)
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch (e) {}
  })();
  const [S, setS] = useState(s0);
  function set(p) {
    setS((o) => Object.assign({}, o, typeof p === 'function' ? p(o) : p));
  }
  function go(scr, extra) {
    set((o) => Object.assign({ stack: o.stack.concat(scr), sheet: null, dir: 'fwd' }, extra || {}));
  }
  function back() {
    set((o) => ({
      stack: o.stack.length > 1 ? o.stack.slice(0, -1) : o.stack,
      sheet: null,
      dir: 'back',
      login: o.stack.length > 2 ? o.login : false
    }));
  }
  function tab(t) {
    set({ stack: [t], sheet: null, dir: 'tab', seen: true });
  }
  function toast(t) {
    set({ toast: t });
  }
  useEffect(
    () => {
      var o = {};
      PERSIST.forEach((k) => {
        o[k] = S[k];
      });
      store('gathr.state', o);
    },
    PERSIST.map((k) => S[k])
  );
  /* a live Supabase session (email code or a Google redirect) signs you in on load */
  useEffect(() => {
    Auth.session().then((u) => {
      if (!u) return;
      set((o) => ({
        signedIn: true,
        email: u.email || o.email,
        me: Object.assign({}, o.me, { name: o.me.name || u.name, photo: o.me.photo || u.photo })
      }));
      var r = store('gathr.resume');
      store('gathr.resume', null);
      if (r && EVENTS[r.cur])
        set({ stack: ['tonight', 'event'], cur: r.cur, sheet: 'list', guests: r.guests || 2, dir: 'fwd' });
    });
  }, []);
  useEffect(() => {
    if (scrTop() !== 'event') return;
    var v = store('gathr.views') || {};
    v[S.cur] = (v[S.cur] || 0) + 1;
    store('gathr.views', v);
  }, [S.stack.length, S.cur]);
  function scrTop() {
    return S.stack[S.stack.length - 1];
  }
  useEffect(() => {
    if (!S.toast) return;
    var id = setTimeout(() => {
      set({ toast: null });
    }, 2400);
    return () => {
      clearTimeout(id);
    };
  }, [S.toast]);
  var scr = S.stack[S.stack.length - 1];
  var ev = EVENTS[S.cur],
    ven = VENUES[ev.venue];
  var plan = S.planned ? EVENTS[S.planned] : null;
  var ctx = {
    S: S,
    set: set,
    go: go,
    back: back,
    tab: tab,
    toast: toast,
    ev: ev,
    ven: ven,
    plan: plan,
    planVen: plan ? VENUES[plan.venue] : null
  };
  ctx.openEvent = (id, sheet) => {
    var gate = EVENTS[id].age >= 21 && !S.age;
    go('event', { cur: id, sheet: gate ? 'age' : sheet || null, after: gate ? sheet || null : null });
  };
  ctx.book = () => {
    var e = EVENTS[S.cur];
    set({ sheet: e.age >= 21 && !S.age ? 'age' : 'list', after: 'list' });
  };
  ctx.toHost = () => {
    set({ mode: 'host', stack: ['hostdoor'], sheet: null, dir: 'tab', seen: true });
    toast('Hosting mode · ' + ((S.org.profile || {}).name || ''));
  };
  ctx.toGuest = () => {
    set({ mode: 'guest', stack: ['you'], sheet: null, dir: 'tab', scanning: false });
    toast('Back to going out');
  };
  ctx.toggleSave = (id) => {
    var was = !!S.saved[id];
    set((o) => {
      var x = Object.assign({}, o.saved);
      if (x[id]) delete x[id];
      else x[id] = 1;
      return { saved: x };
    });
    toast(was ? 'Removed from Plans' : 'Saved to Plans');
  };
  var screens = {
    hostdoor: HostDoor,
    hostguests: HostGuests,
    hostprofile: HostProfile,
    orgintro: OrgIntro,
    orgsetup: OrgSetup,
    orghome: OrgHome,
    orgform: OrgForm,
    orgevent: OrgEvent,
    invite: Invite,
    welcome: Welcome,
    nights: Vibe,
    vibe: Vibe,
    areas: Areas,
    phone: Phone,
    notifs: Notifs,
    age: Age,
    tonight: Tonight,
    map: MapScreen,
    search: Search,
    plans: Plans,
    you: You,
    venue: Venue,
    event: EventScreen,
    pass: Pass,
    group: Group,
    ready: Ready,
    recap: Recap,
    editprofile: EditProfile,
    friendslist: FriendsList,
    newplan: NewPlan,
    wrapped: Wrapped,
    venuedash: VenueDash
  };
  var Scr = screens[scr] || Tonight;
  var first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    var el = document.querySelector('.phone .screen');
    if (el && !S.sheet) el.focus({ preventScroll: true });
  }, [scr, S.cur]);
  var hostTabs = S.mode === 'host' && HOST_TABS.some((t) => t[0] === scr);
  var showTabs = hostTabs || (S.mode !== 'host' && TABS.indexOf(scr) >= 0 && !(scr === 'map' && S.mapSel));
  return (
    <div className={'stage' + (REVIEW ? ' has-review' : '')}>
      {REVIEW ? <ReviewPanel ctx={ctx} scr={scr} /> : null}
      <div className="phone-wrap">
        <div className="phone">
          <div
            key={scr + (scr === 'event' || scr === 'venue' ? S.cur : '')}
            tabIndex={-1}
            className={'screen nav-' + (S.dir || 'tab') + (scr === 'map' ? ' no-scroll' : '')}
          >
            <Scr ctx={ctx} />
          </div>
          {showTabs ? <div className="tab-fade" /> : null}
          {showTabs ? (
            <div className="tabwrap">
              {hostTabs ? <HostTabBar active={scr} onChange={tab} /> : <TabBar active={scr} onChange={tab} />}
            </div>
          ) : null}
          {S.scanning ? <Scanner ctx={ctx} /> : null}
          {S.sheet ? <SheetLayer ctx={ctx} /> : null}
          <div className="toast-live" role="status" aria-live="polite">
            {S.toast ? (
              <div key={S.toast} className="toast">
                {S.toast}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {REVIEW ? (
        <p className="hint">
          {'Review mode · real Pune listings from District and Sort My Scene · crowd, friends and votes are sample data · ' +
            (Auth.live ? 'sign-in live' : 'sign-in in demo mode') +
            ' · ' +
            (Pay.live ? 'Razorpay live' : 'payments in demo mode')}
        </p>
      ) : null}
    </div>
  );
}
