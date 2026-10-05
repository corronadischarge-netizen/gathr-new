import { useEffect, useRef, useState } from 'react';
import { HOST_TABS, HostTabBar } from './components/HostTabBar';
import { ReviewPanel } from './components/ReviewPanel';
import { Scanner } from './components/Scanner';
import { REVIEW } from './config';
import { EVENTS, VENUES, isPast } from './data/listings';
import { NEXT_CITIES } from './data/options';
import { hostNights } from './data/hostNights';
import { ORG_KEY, orgLoad, setRemoteFeed, syncOrg } from './data/organisers';
import { TabBar } from './design-system';
import { useEdgeSwipe } from './hooks/useEdgeSwipe';
import { useSheetExit } from './hooks/useSheetExit';
import { useScreenTransition } from './hooks/useScreenTransition';
import { store } from './lib/utils';
import { TABS } from './navigation';
import { Admin } from './screens/Admin';
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
import * as Door from './services/door';
import { startPush } from './services/push';
import * as Remote from './services/remote';
import { Pay } from './services/payments';
import { SheetLayer } from './sheets/SheetLayer';

/* Android's system back gesture already goes back, so the in-app edge swipe is for iPhone and the web */
const ANDROID = /Android/i.test(navigator.userAgent);

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
    'hostNight',
    'myBookings',
    'glSeen',
    'cityWant',
    'cityAsk',
    'energy'
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
  function back(how) {
    set((o) => ({
      stack: o.stack.length > 1 ? o.stack.slice(0, -1) : o.stack,
      sheet: null,
      dir: how === 'swipe' ? 'swipe' : 'back',
      login: o.stack.length > 2 ? o.login : false
    }));
  }
  function tab(t) {
    set({ stack: [t], sheet: null, dir: 'tab', seen: true });
  }
  /* a short message at the top; with an action (e.g. Undo) it stays 4s instead of 2.4s */
  function toast(t, action) {
    set({ toast: t, toastAct: action ? Object.assign({ for: t }, action) : null });
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
  /* With Supabase on: venues and the live feed for everyone, and for a signed-in user their organiser
     (profile, venues, nights) and whether they're a gathr admin. Their phone's copy is replaced by the
     database's, keeping nights they haven't saved to it yet. */
  useEffect(() => {
    if (!Remote.remoteOn) return;
    var feedReady = Remote.pullVenues()
      .then(() => Remote.pullFeed())
      .then((feed) => {
        setRemoteFeed(feed);
        set({ feedAt: Date.now() });
      })
      .catch(() => {});
    if (!S.signedIn) return;
    Remote.pullMine()
      .then((mine) => {
        if (!mine) return;
        var cur = orgLoad();
        var next = Object.assign({}, cur, {
          profile: mine.profile,
          events: mine.events.concat((cur.events || []).filter((o) => !o.remote))
        });
        store(ORG_KEY, next);
        syncOrg(next);
        set({ org: next });
      })
      .catch(() => {});
    Remote.amAdmin()
      .then((yes) => set({ isAdmin: yes }))
      .catch(() => {});
    // guest lists you're on: a new one lights the bell on This week
    feedReady
      .then(() => Remote.pullMyGuestLists())
      .then((l) =>
        set((o) => ({
          myGuestLists: l,
          notifSeen: l.some((g) => (o.glSeen || []).indexOf(g.entryId) < 0) ? false : o.notifSeen
        }))
      )
      .catch(() => {});
    // your bookings for gathr nights follow you to any phone; the newest upcoming one is your plan
    feedReady
      .then(() => Remote.pullMyBookings())
      .then((list) => {
        var mine = {};
        list.forEach((b) => (mine[b.event] = b));
        set((o) => {
          var next = { myBookings: mine };
          var up = list.filter((b) => EVENTS[b.event] && !isPast(EVENTS[b.event])).pop();
          if (up && !(o.planned && EVENTS[o.planned] && !isPast(EVENTS[o.planned])))
            Object.assign(next, { planned: up.event, guests: up.passes, onList: true });
          return next;
        });
      })
      .catch(() => {});
  }, [S.signedIn]);
  /* notifications: on the installed app, ask to send them and register this phone; and your inbox for Updates
     (a new unread one lights the bell). Refreshed when a notification arrives while the app is open. */
  useEffect(() => {
    if (!Remote.remoteOn || !S.signedIn) return;
    startPush({ set: set, toast: toast });
  }, [S.signedIn]);
  useEffect(() => {
    if (!Remote.remoteOn || !S.signedIn) return;
    Remote.pullInbox()
      .then((list) =>
        set((o) => ({
          inbox: list,
          notifSeen: list.some((n) => !n.read_at && n.kind !== 'guest_list') ? false : o.notifSeen
        }))
      )
      .catch(() => {});
  }, [S.signedIn, S.inboxAt]);
  /* a tapped notification opens its place once the nights it points at have loaded */
  useEffect(() => {
    var d = S.pendingOpen;
    if (!d) return;
    var ev = d.event_id,
      mine = S.org && S.org.profile;
    if (d.kind === 'guest_list') {
      if (!EVENTS[ev]) return; // the feed is still loading
      var gate = EVENTS[ev].age >= 21 && !S.age;
      set({
        pendingOpen: null,
        mode: 'guest',
        stack: ['tonight', 'event'],
        cur: ev,
        sheet: gate ? 'age' : 'list',
        after: gate ? 'list' : null,
        bookMode: 'guest',
        bookList: d.list_id,
        dir: 'fwd'
      });
    } else if (d.kind === 'night_live' || d.kind === 'night_back') {
      if (!mine || !(S.org.events || []).some((o) => o.id === ev)) return; // their nights are still loading
      set({ pendingOpen: null, mode: 'host', stack: ['orghome', 'orgevent'], orgView: ev, dir: 'fwd' });
    } else if (d.kind === 'verified') {
      set(
        mine ? { pendingOpen: null, mode: 'host', stack: ['orghome'], dir: 'mode' } : { pendingOpen: null }
      );
    } else set({ pendingOpen: null });
  }, [S.pendingOpen, S.feedAt, S.org]);
  /* other cities: which ones you asked to hear about; an ask made before signing in is sent once you're in */
  useEffect(() => {
    if (!S.signedIn) return;
    var ask = S.cityAsk,
      name = ask && (NEXT_CITIES.filter((x) => x[0] === ask)[0] || [])[1];
    var send = !ask ? Promise.resolve() : Remote.remoteOn ? Remote.wantCity(ask) : Promise.resolve();
    send
      .then(() => (Remote.remoteOn ? Remote.myCities() : null))
      .then((list) => {
        set((o) => {
          var mine = list || o.cityWant || [];
          if (ask && mine.indexOf(ask) < 0) mine = mine.concat(ask);
          return { cityWant: mine, cityAsk: null };
        });
        if (name) toast('We’ll tell you when gathr opens in ' + name);
      })
      .catch(() => {});
  }, [S.signedIn]);
  /* your name, phone and age band go to your private profile (hosts see only the name on your bookings) */
  useEffect(() => {
    if (!Remote.remoteOn || !S.signedIn) return;
    var t = setTimeout(() => {
      Remote.pushMe(S).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [S.signedIn, S.me && S.me.name, S.phone, S.age]);
  /* hosting: who's coming to your gathr nights and who's in, from every phone. Refreshed when you open a
     host screen, and every 15 seconds on the door and guest screens, so other door phones' scans show up. */
  var hostScreen = S.stack[S.stack.length - 1];
  useEffect(() => {
    if (!Remote.remoteOn || S.mode !== 'host' || !S.org || !S.org.profile) return;
    var door = { set: set, toast: toast };
    function refresh() {
      hostNights(S)
        .filter((k) => EVENTS[k] && EVENTS[k].remote)
        .forEach((id) => {
          Remote.pullGuests(id)
            .then((list) => set((o) => ({ remoteGuests: Object.assign({}, o.remoteGuests, { [id]: list }) })))
            .catch(() => {});
          Door.loadCheckins(door, id);
        });
      Door.flush(door);
    }
    refresh();
    if (['hostdoor', 'hostguests', 'orgevent'].indexOf(hostScreen) < 0) return;
    var t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [S.mode, hostScreen, S.feedAt, S.org]);
  /* check-ins waiting for signal go as soon as the phone is back online */
  useEffect(() => {
    if (!Remote.remoteOn) return;
    var door = { set: set, toast: toast };
    var go = () => Door.flush(door);
    go();
    window.addEventListener('online', go);
    return () => window.removeEventListener('online', go);
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
    var id = setTimeout(
      () => {
        set({ toast: null });
      },
      S.toastAct && S.toastAct.for === S.toast ? 4000 : 2400
    );
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
    set({ mode: 'host', stack: ['hostdoor'], sheet: null, dir: 'mode', seen: true });
    toast('Hosting mode · ' + ((S.org.profile || {}).name || ''));
  };
  ctx.toGuest = () => {
    set({ mode: 'guest', stack: ['you'], sheet: null, dir: 'mode', scanning: false });
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
    if (was)
      toast('Removed from Plans', {
        label: 'Undo',
        run: () => {
          set((o) => ({ saved: Object.assign({}, o.saved, { [id]: 1 }), toast: null }));
        }
      });
    else toast('Saved to Plans');
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
    venuedash: VenueDash,
    admin: Admin
  };
  var Scr = screens[scr] || Tonight;
  var scrKey = scr + (scr === 'event' || scr === 'venue' ? S.cur : '');
  var screenRef = useRef(null),
    ghostRef = useRef(null),
    underRef = useRef(null),
    phoneRef = useRef(null);
  useScreenTransition(scrKey, S.dir, screenRef, ghostRef);
  var sheetRef = useRef(null),
    sheetExitRef = useRef(null);
  useSheetExit(S.sheet, sheetRef, sheetExitRef);
  /* swipe back from the left edge (iPhone and web; Android uses its own back gesture, handled below) */
  const [under, setUnder] = useState(false);
  var Under = under && S.stack.length > 1 ? screens[S.stack[S.stack.length - 2]] || Tonight : null;
  var swipe = useEdgeSwipe({
    enabled: S.stack.length > 1 && !S.sheet && !S.scanning,
    phoneRef: phoneRef,
    screenRef: screenRef,
    underRef: underRef,
    onStart: () => setUnder(true),
    onBack: () => {
      setUnder(false);
      back('swipe');
    },
    onCancel: () => setUnder(false)
  });
  var canEdgeSwipe = S.stack.length > 1 && !S.sheet && !S.scanning && !ANDROID;
  /* Android back button and gesture: close what's open first, then go back a screen, then home, then leave */
  var hwBack = useRef(null);
  hwBack.current = (CapApp) => {
    if (S.sheet) {
      if (!S.busy) set({ sheet: null });
    } else if (S.scanning) set({ scanning: false });
    else if (scr === 'map' && S.mapSel) set({ mapSel: null });
    else if (S.stack.length > 1) back();
    else if (scr === 'welcome' && S.wstep > 0) set({ wstep: S.wstep - 1 });
    else if (TABS.indexOf(scr) > 0) tab('tonight');
    else if (S.mode === 'host' && scr !== 'hostdoor' && HOST_TABS.some((t) => t[0] === scr)) tab('hostdoor');
    else CapApp.minimizeApp();
  };
  useEffect(() => {
    var C = window.Capacitor;
    if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
    var handle = null,
      gone = false;
    import('@capacitor/app').then((m) =>
      m.App.addListener('backButton', () => hwBack.current(m.App)).then((h) => {
        if (gone) h.remove();
        else handle = h;
      })
    );
    return () => {
      gone = true;
      if (handle) handle.remove();
    };
  }, []);
  var first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    var el = screenRef.current;
    if (el && !S.sheet) el.focus({ preventScroll: true });
  }, [scr, S.cur]);
  var hostTabs = S.mode === 'host' && HOST_TABS.some((t) => t[0] === scr);
  var showTabs = hostTabs || (S.mode !== 'host' && TABS.indexOf(scr) >= 0 && !(scr === 'map' && S.mapSel));
  return (
    <div className={'stage' + (REVIEW ? ' has-review' : '')}>
      {REVIEW ? <ReviewPanel ctx={ctx} scr={scr} /> : null}
      <div className="phone-wrap">
        <div className="phone" ref={phoneRef}>
          {Under ? (
            <div ref={underRef} className="screen under" aria-hidden="true" inert="">
              <Under ctx={ctx} />
            </div>
          ) : null}
          <div ref={ghostRef} className="ghost-layer" aria-hidden="true" />
          <div
            key={scrKey}
            ref={screenRef}
            tabIndex={-1}
            className={'screen nav-' + (S.dir || 'tab') + (scr === 'map' ? ' no-scroll' : '')}
          >
            <Scr ctx={ctx} />
          </div>
          {canEdgeSwipe ? <div className="edge-swipe" aria-hidden="true" {...swipe} /> : null}
          {showTabs ? <div className="tab-fade" /> : null}
          {showTabs ? (
            <div
              key={hostTabs ? 'host' : 'guest'}
              className={'tabwrap' + (S.dir === 'mode' ? ' mode-in' : '')}
            >
              {hostTabs ? <HostTabBar active={scr} onChange={tab} /> : <TabBar active={scr} onChange={tab} />}
            </div>
          ) : null}
          {S.scanning ? <Scanner ctx={ctx} /> : null}
          {S.sheet ? <SheetLayer ctx={ctx} hostRef={sheetRef} /> : null}
          <div ref={sheetExitRef} className="sheet-exit" aria-hidden="true" />
          <div className="toast-live" role="status" aria-live="polite">
            {S.toast ? (
              <div key={S.toast} className="toast">
                {S.toast}
                {S.toastAct && S.toastAct.for === S.toast ? (
                  <button type="button" className="toast-act" onClick={S.toastAct.run}>
                    {S.toastAct.label}
                  </button>
                ) : null}
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
