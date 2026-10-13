import { useEffect, useRef, useState } from 'react';
import { HOST_TABS, HostTabBar } from './components/HostTabBar';
import { ReviewPanel } from './components/ReviewPanel';
import { Scanner } from './components/Scanner';
import { HOME_LAYOUT, REVIEW, TEST } from './config';
import { EVENTS, VENUES, isPast } from './data/listings';
import { NEXT_CITIES } from './data/options';
import { hostNights } from './data/hostNights';
import { ORG_KEY, orgLoad, setRemoteFeed, syncOrg } from './data/organisers';
import { TabBar, Toast } from './design-system';
import { useEdgeSwipe } from './hooks/useEdgeSwipe';
import { useSheetExit } from './hooks/useSheetExit';
import { useScreenTransition } from './hooks/useScreenTransition';
import { scrollToTop, useScrollMemory } from './hooks/useScrollMemory';
import { PENDING_AFTER, POLL_EVERY, bookingStep, inFlight, requestId } from './lib/booking';
import { rupees } from './data/format';
import { haptic } from './lib/haptics';
import { log } from './lib/log';
import { ms, reducedMotion } from './lib/motion';
import { optimistic } from './lib/optimistic';
import { cleanCode } from './lib/promoterInvite';
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
import { DsPreview } from './screens/DsPreview';
import { HomeDoor } from './screens/HomeDoor';
import { AllNights } from './screens/AllNights';
import { loadTravel } from './services/travel';
import { pickedAreas } from './data/homeData';
import { OrgEvent } from './screens/OrgEvent';
import { OrgForm } from './screens/OrgForm';
import { OrgHome } from './screens/OrgHome';
import { OrgIntro } from './screens/OrgIntro';
import { OrgSetup } from './screens/OrgSetup';
import { PromoInvite } from './screens/PromoInvite';
import { Promoting } from './screens/Promoting';
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
import { forgetPush, startPush } from './services/push';
import * as Remote from './services/remote';
import { Pay } from './services/payments';
import { SheetLayer } from './sheets/SheetLayer';

/* Android's system back gesture already goes back, so the in-app edge swipe is for iPhone and the web */
const ANDROID = /Android/i.test(navigator.userAgent);

/* Everything on this device that belongs to the person signed in. Logging out removes all of it
   (the "use it sideways" choice and unsent door check-ins aren't theirs, so they stay). */
const PERSONAL_KEYS = ['gathr.me', 'gathr.state', 'gathr.resume', 'gathr.views'];

export function App() {
  /* a first visit: nobody signed in, nothing saved */
  var blank = () => ({
    stack: ['welcome'],
    dir: 'tab',
    login: false,
    loc: false,
    group: null, // Going as (home v3): who's going, for the door verdict. null = not set
    groupOff: TEST.noGroup, // ?group=none (test): the home as if no group or plan were set
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
    me: { name: '', handle: '', area: '', bio: '', photo: null, upi: '' },
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
    upHidden: [],
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
  });
  var s0 = blank();
  s0.me = Object.assign(s0.me, store('gathr.me') || {});
  /* returning visitors pick up where they left off: bookings, saves, plans, sign-in and settings live on the device */
  var PERSIST = [
    'saved',
    'group',
    'savedOnce',
    'anFilters',
    'anOpen',
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
    'upHidden',
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
    'energy',
    'bk'
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
      /* a booking that was paying when the app closed: back on its sheet, asking the bank about the same payment
         (interactions spec 7, "returning resumes it"). Anything else starts fresh next time */
      if (inFlight(s0.bk) && EVENTS[s0.bk.ev]) {
        s0.stack = ['tonight', 'event'];
        s0.cur = s0.bk.ev;
        s0.sheet = 'list';
        s0.dir = 'fwd';
      } else s0.bk = null;
    }
    if (s0.mode === 'host' && s0.org && s0.org.profile && s0.seen) s0.stack = ['hostdoor'];
    else s0.mode = 'guest';
    var m = /#(e|plan|pi)=([^&]+)(.*)$/.exec(location.hash);
    if (m) s0.mode = 'guest';
    // a promoter invite link: the invite, ready to sign in and accept
    if (m && m[1] === 'pi') {
      s0.piCode = cleanCode(decodeURIComponent(m[2]));
      s0.stack = ['tonight', 'promoinvite'];
      s0.dir = 'fwd';
      s0.seen = true;
    }
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
  var bk = useRef(s0.bk || null), // the booking, changed at once on every event (see bkSend)
    live = useRef(S), // the latest state, for answers that arrive later
    freeBusy = useRef(false),
    saving = useRef({});
  live.current = S;
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
    // the tab you're on: scroll to the top; already at the top of Tonight, refresh (interactions spec 3)
    if (S.stack.length === 1 && S.stack[0] === t && !S.sheet) {
      var el = screenRef.current;
      if (el && el.scrollTop > 4) scrollToTop(el, ms('--motion-slow'), reducedMotion());
      else if (t === 'tonight') refresh();
      return;
    }
    set({ stack: [t], sheet: null, dir: 'tab', seen: true });
  }
  /* fetch the live feed again (tap the Tonight tab at the top); quiet: the home updates in place */
  function refresh() {
    // demo mode has nothing to fetch: a short wait so a pull-to-refresh still reads as done
    if (!Remote.remoteOn) return new Promise((r) => setTimeout(r, 500));
    return Remote.pullFeed()
      .then((feed) => {
        setRemoteFeed(feed);
        set({ feedAt: Date.now(), feedFailed: false });
      })
      .catch(() => {
        if (!navigator.onLine) toast("You're offline. Showing what we had");
      });
  }
  /* a short message near the bottom (Toast); it closes itself after 2.4 s, or 5 s with an action (Undo) */
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
      if (r && r.pi) set({ mode: 'guest', stack: ['tonight', 'promoinvite'], piCode: r.pi, dir: 'fwd' });
      else if (r && EVENTS[r.cur])
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
      // the feed couldn't load (offline): the home stops waiting and shows what it has
      .catch(() => set({ feedFailed: true }));
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
    // your saves follow you too: what's on the server joins what's on this phone
    Remote.pullSaves()
      .then((ids) => {
        if (ids && ids.length)
          set((o) => ({ saved: Object.assign({}, o.saved, Object.fromEntries(ids.map((k) => [k, 1]))) }));
      })
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
    } else if (d.kind === 'night_review' || d.kind === 'night_reported') {
      set({ pendingOpen: null, mode: 'guest', stack: ['you', 'admin'], dir: 'fwd' });
    } else if (
      d.kind === 'night_live' ||
      d.kind === 'night_back' ||
      d.kind === 'night_submitted' ||
      d.kind === 'night_rejected'
    ) {
      if (!mine || !(S.org.events || []).some((o) => o.id === ev)) return; // their nights are still loading
      set({ pendingOpen: null, mode: 'host', stack: ['orghome', 'orgevent'], orgView: ev, dir: 'fwd' });
    } else if (d.kind === 'promoter_joined') {
      // someone accepted your invite: that night's guest lists, where their list now shows
      if (!mine) return;
      set({ pendingOpen: null, mode: 'host', stack: ['hostguests'], hostNight: ev, dir: 'mode' });
    } else if (d.kind === 'promoter_invite') {
      set({ pendingOpen: null, mode: 'guest', stack: ['you', 'promoting'], dir: 'fwd' });
    } else if (d.kind === 'verified') {
      set(
        mine ? { pendingOpen: null, mode: 'host', stack: ['orghome'], dir: 'mode' } : { pendingOpen: null }
      );
    } else set({ pendingOpen: null });
  }, [S.pendingOpen, S.feedAt, S.org]);
  /* promoters: take any lists hosts invited you to (by your email), then load the nights you're promoting.
     Again when a new notification arrives (it may be an invite). */
  useEffect(() => {
    if (!Remote.remoteOn || !S.signedIn) return;
    Remote.acceptPromoterLists()
      .then(() => Remote.myPromoterLists())
      .then((l) => set({ promoting: l }))
      .catch(() => {});
  }, [S.signedIn, S.inboxAt]);
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
  /* Log out: end the session and wipe the person from this phone and from the screen. The whole state is
     replaced (not merged), so their name, photo, bookings, lists and inbox can't linger. Without Supabase the
     organiser exists only on this phone, so it stays rather than being lost. */
  ctx.signOut = () => {
    forgetPush().then(() => Auth.signOut());
    PERSONAL_KEYS.forEach((k) => store(k, null));
    bk.current = null;
    if (Remote.remoteOn) {
      store(ORG_KEY, null);
      syncOrg(orgLoad());
    }
    setS(Object.assign(blank(), { org: Remote.remoteOn ? orgLoad() : S.org, feedAt: S.feedAt, toast: 'Logged out' }));
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
  /* the heart (interactions spec 2.5, 5): it fills at once and syncs in the background when you're signed in;
     if the sync fails the heart goes back, with "That didn't go through. Try again · Retry". "Saved to Plans" shows
     only the first time ever; removing shows Undo */
  ctx.refresh = refresh;
  ctx.toggleSave = (id) => {
    var was = !!S.saved[id];
    var flip = (on) =>
      set((o) => {
        var x = Object.assign({}, o.saved);
        if (on) x[id] = 1;
        else delete x[id];
        return { saved: x };
      });
    var live = S.signedIn && Remote.savesLive();
    optimistic(ctx, {
      apply: () => flip(!was),
      sync: () => (live ? (was ? Remote.unsaveNight(id) : Remote.saveNight(id)) : null),
      rollback: () => flip(was)
    });
    if (was)
      toast('Removed from Plans', {
        label: 'Undo',
        run: () => {
          set({ toast: null });
          flip(true);
          if (live) Remote.saveNight(id).catch(() => {});
        }
      });
    else if (!S.savedOnce) {
      set({ savedOnce: true });
      toast('Saved to Plans');
    }
  };

  /* ---------- booking (interactions spec 7) ----------
     The booking's state lives here, not in the sheet, so closing the sheet, the background and a restart all keep
     it. bk.current changes at once on every event (before the screen redraws), so two taps in the same moment
     can't both start a payment: the second PAY isn't accepted by the machine and does nothing. */
  ctx.bkSend = bkSend;
  function bkSend(ev, data) {
    var from = bk.current ? bk.current.state : 'idle',
      next = bookingStep(bk.current, ev, data);
    if (!next) return false;
    if (next.state === 'idle') next = null;
    bk.current = next;
    // "Stop paying?" only makes sense while money may be moving
    set(inFlight(next) ? { bk: next } : { bk: next, stopAsk: false });
    log('booking', { from: from, on: ev, to: next ? next.state : 'idle', nightId: next ? next.ev : undefined });
    return true;
  }
  /* the sheet opens: a fresh booking, unless a payment is still open (then the sheet shows that one) */
  ctx.bkOpen = (id, blocked) => {
    if (inFlight(bk.current)) return;
    bk.current = null;
    bkSend(blocked ? 'OPEN_BLOCKED' : 'OPEN', { ev: id, tries: 0, err: null, rid: null });
  };
  /* Pay: one request id per attempt; the payment service answers each id once */
  ctx.pay = (info) => {
    if (!bkSend('PAY', Object.assign({}, info, { rid: requestId() }))) return false;
    charge(bk.current);
    return true;
  };
  /* free list nights: the same machine without paying (selecting → success) */
  ctx.bookFree = (info) => {
    if (freeBusy.current || !bk.current || bk.current.state !== 'selecting') return Promise.resolve(false);
    freeBusy.current = true;
    var b = Object.assign({}, bk.current, info);
    var saved = b.dbNight ? Remote.book(b.ev, b.party.couples, b.party.stags, b.party.girls, null) : Promise.resolve(null);
    return saved.then(
      (booking) => {
        freeBusy.current = false;
        if (bkSend('FREE', info)) booked(b, null, booking);
        return true;
      },
      (err) => {
        freeBusy.current = false;
        haptic.error();
        toast(Remote.sayError(err));
        return false;
      }
    );
  };
  function charge(b) {
    Pay.charge({ rid: b.rid, amount: b.total, title: b.title, email: S.email, phone: S.phone }).then(
      (r) => paid(b.rid, r.id),
      (err) => failed(b.rid, err.message)
    );
  }
  /* the bank said yes (from the payment itself or from asking again): a gathr night is then booked in the
     database, once per request id, however many times the yes arrives */
  function paid(rid, payId) {
    var b = bk.current;
    if (!b || b.rid !== rid || !inFlight(b) || saving.current[rid]) return;
    if (!b.dbNight) {
      if (bkSend('PAID', { payId: payId })) booked(b, payId, null);
      return;
    }
    saving.current[rid] = true;
    Remote.book(b.ev, b.party.couples, b.party.stags, b.party.girls, payId).then(
      (booking) => {
        if (bkSend('PAID', { payId: payId })) booked(b, payId, booking);
      },
      (err) => {
        delete saving.current[rid];
        // with real payments this case needs a refund: the server-side payment check (planned) closes it
        failed(rid, Remote.sayError(err) + (payId && !/^test_/.test(payId) ? '. Your payment reference is ' + payId + '; we’ll refund it' : ''));
      }
    );
  }
  function failed(rid, why) {
    var b = bk.current;
    if (!b || b.rid !== rid) return;
    if (bkSend('FAILED', { err: why || 'You haven’t been charged' })) haptic.error();
  }
  /* you're in: the pass, with the tick and the wristband (they play once, on the pass, for this booking) */
  function booked(b, payId, booking) {
    var earned = b.n >= 3 && b.total && !(booking && booking.guests) ? 50 : 0,
      onSheet = live.current.sheet === 'list';
    set((o) => ({
      celebrate: b.rid || 'free_' + Date.now(),
      onList: true,
      planned: b.ev,
      cur: b.ev,
      guests: booking ? booking.passes : b.n,
      sent: !!b.gpb,
      sheet: onSheet ? null : o.sheet,
      stack: onSheet ? o.stack.concat('pass') : o.stack,
      dir: onSheet ? 'fwd' : o.dir,
      payId: payId || null,
      myBookings: booking ? Object.assign({}, o.myBookings, { [b.ev]: booking }) : o.myBookings,
      credit: o.credit - (b.credit || 0) + earned,
      gp: b.gpb ? Object.assign({}, o.gp, { stage: 'booked', booked: b.ev, fresh: false }) : o.gp,
      gpBook: null
    }));
    // closed the sheet while it was paying: the answer still arrives, as a toast with the way to the pass
    if (!onSheet)
      toast(EVENTS[b.ev].rsvp || !b.total ? "You're on the list" : "You're in", {
        label: 'Show pass',
        run: () => go('pass', { cur: b.ev, toast: null })
      });
    if (earned) setTimeout(() => toast('+' + rupees(earned) + ' planner credit for booking your group'), 2400);
  }
  /* while paying: after 20 s with no answer, "Checking with your bank"; while pending, ask about the same request id
     every few seconds; coming back to the app asks straight away. A restart mid-payment joins the same payment */
  useEffect(() => {
    var b = S.bk;
    if (!inFlight(b)) return;
    var stop = false,
      timer = null,
      poll = null;
    function ask() {
      Pay.status(b.rid).then((r) => {
        if (stop) return;
        if (r.status === 'paid') paid(b.rid, r.id);
        else if (r.status === 'failed') failed(b.rid, 'Your bank declined it. You haven’t been charged');
        else if (r.status === 'none') failed(b.rid, 'The payment never reached the bank. You haven’t been charged');
      });
    }
    if (b.state === 'paying') timer = setTimeout(() => bkSend('TIMEOUT'), Math.max(0, b.at + PENDING_AFTER - Date.now()));
    else poll = setInterval(ask, POLL_EVERY);
    function back() {
      if (document.visibilityState !== 'visible') return;
      if (b.state === 'paying' && Date.now() - b.at >= PENDING_AFTER) bkSend('TIMEOUT');
      ask();
    }
    document.addEventListener('visibilitychange', back);
    return () => {
      stop = true;
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', back);
    };
  }, [S.bk && S.bk.state, S.bk && S.bk.rid]);
  // opened mid-payment after a restart: rejoin the same payment (same request id, so no second charge)
  useEffect(() => {
    if (inFlight(bk.current) && bk.current.state === 'paying' && !Pay.live) charge(bk.current);
  }, []);
  /* closing the booking sheet (✕, scrim, Android back): while money may be moving it asks "Stop paying?" first */
  ctx.closeSheet = () => {
    if (S.sheet === 'list' && inFlight(bk.current)) {
      set({ stopAsk: true });
      return;
    }
    if (S.busy) return;
    if (S.sheet === 'list' && bk.current && !inFlight(bk.current)) bkSend('CLOSE');
    set({ sheet: null, stopAsk: false });
  };
  var screens = {
    hostdoor: HostDoor,
    hostguests: HostGuests,
    hostprofile: HostProfile,
    orgintro: OrgIntro,
    orgsetup: OrgSetup,
    promoinvite: PromoInvite,
    promoting: Promoting,
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
    dspreview: DsPreview,
    allnights: AllNights,
    age: Age,
    tonight: HOME_LAYOUT === 'classic' ? Tonight : HomeDoor,
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
  // every screen keeps its scroll: back, swipe and tab changes return to where you were
  useScrollMemory(S.stack.join('>') + (scr === 'event' || scr === 'venue' ? ':' + S.cur : ''), S.dir, screenRef);
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
    if (S.sheet) ctx.closeSheet();
    else if (S.scanning) set({ scanning: false });
    else if (scr === 'map' && S.mapSel) set({ mapSel: null });
    // an expanded section closes before the screen does (All nights: "Not for your group")
    else if (scr === 'allnights' && S.anOpen && Object.values(S.anOpen).some(Boolean)) set({ anOpen: {} });
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
  /* In a browser (not the installed app), Android's back is the browser's back. The app keeps one spare history
     entry, so a back press runs the same steps as the app's back (sheet first, then the screen, then home) and only
     leaves from the home (interactions spec 3) */
  useEffect(() => {
    var C = window.Capacitor;
    if (C && C.isNativePlatform && C.isNativePlatform()) return;
    var leaving = false;
    try {
      history.pushState({ gathr: 1 }, '');
    } catch (e) {
      return;
    }
    function onPop() {
      if (leaving) return;
      hwBack.current({
        minimizeApp: () => {
          leaving = true;
          history.back(); // at the home with nothing open: the browser goes back for real
        }
      });
      if (!leaving)
        try {
          history.pushState({ gathr: 1 }, '');
        } catch (e) {}
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  /* offline: the home keeps the nights it had, and says so once (home v3 3.9) */
  useEffect(() => {
    var off = () => toast("You're offline. Showing what we had");
    window.addEventListener('offline', off);
    if (!navigator.onLine || TEST.offline) off();
    return () => window.removeEventListener('offline', off);
  }, []);
  /* road travel times from your picked areas to every venue (routing service; kept on the phone for a week) */
  var areasKey = pickedAreas(S).join('|');
  useEffect(() => {
    loadTravel(pickedAreas(S), VENUES).then((m) => set({ travel: m }));
  }, [areasKey]);
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
  // All nights (home v3) keeps the tab bar, under Tonight, as board 02 shows
  var showTabs =
    hostTabs || (S.mode !== 'host' && (TABS.indexOf(scr) >= 0 || scr === 'allnights') && !(scr === 'map' && S.mapSel));
  return (
    <div className={'stage' + (REVIEW ? ' has-review' : '')}>
      {REVIEW ? <ReviewPanel ctx={ctx} scr={scr} /> : null}
      <div className="phone-wrap">
        <div className={'phone' + (S.mode === 'host' ? ' g-host' : '')} ref={phoneRef}>
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
              {hostTabs ? <HostTabBar active={scr} onChange={tab} /> : <TabBar active={scr === 'allnights' ? 'tonight' : scr} onChange={tab} />}
            </div>
          ) : null}
          {S.scanning ? <Scanner ctx={ctx} /> : null}
          {S.sheet ? <SheetLayer ctx={ctx} hostRef={sheetRef} /> : null}
          <div ref={sheetExitRef} className="sheet-exit" aria-hidden="true" />
          <div className="toast-live" aria-live="polite">
            {S.toast ? (
              <Toast
                key={S.toast}
                docked
                aboveTabBar={showTabs}
                onClose={() => set({ toast: null })}
                action={S.toastAct && S.toastAct.for === S.toast ? S.toastAct.label : null}
                onAction={S.toastAct && S.toastAct.run}
              >
                {S.toast}
              </Toast>
            ) : null}
          </div>
        </div>
      </div>
      {REVIEW ? (
        <p className="hint">
          {'Review mode · real Pune listings from District and Sort My Scene · bookings, friends and votes are sample data · ' +
            (Auth.live ? 'sign-in live' : 'sign-in in demo mode') +
            ' · ' +
            (Pay.live ? 'Razorpay live' : 'payments in demo mode')}
        </p>
      ) : null}
    </div>
  );
}
