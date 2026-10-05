import { VENUES } from '../data/listings';
import { AREA_XY, orgVenueIds } from '../data/organisers';
import { family, legacyKind } from '../data/taxonomy';
import { Auth } from './auth';
import { supabase, supabaseOn } from './supabase';

/* Organisers, their venues and their nights in Supabase (step 2).
   The app keeps working from its local copy (state.org), and this file keeps that copy in step with the
   database: it pulls on sign-in and app start, and pushes when an organiser saves. In demo mode (no Supabase)
   none of this runs and everything stays on the phone. */
export const remoteOn = supabaseOn && Auth.live;

var me = null; // the signed-in user's id, once known
function db() {
  return supabase().then((c) =>
    c.auth.getSession().then((r) => {
      me = (r.data && r.data.session && r.data.session.user.id) || null;
      return c;
    })
  );
}
function ok(r) {
  if (r.error) throw r.error;
  return r.data;
}
/* database errors, said simply */
export function sayError(e) {
  var m = (e && e.message) || '';
  if (/Pick one of your venues/.test(m)) return 'Pick one of your venues for this night.';
  if (/main venue/.test(m)) return m;
  if (/guestlist is full/.test(m)) return 'This night is full. There are no passes left.';
  if (/The night is full/.test(m)) return 'This night is full. There are no passes left.';
  if (/guest list is full|not on this guest list|plus-one a name/.test(m)) return m.replace(/\.?\s*$/, '.');
  if (e && e.code === '23505' && /guest_lists_one_invite/.test(m))
    return 'You’ve already invited them to this night.';
  if (e && e.code === '23505' && /phone/.test(m)) return 'That phone number is already on this guest list.';
  if (e && e.code === '23505' && /guest_list/.test(m)) return 'That email is already on this guest list.';
  if (/already have a list|That's you|waiting for its promoter/.test(m)) return m.replace(/\.?\s*$/, '.');
  if (/null value in column "email"|schema cache/.test(m))
    return 'This needs the latest gathr database update. Add their email for now.';
  if (/row-level security|permission/i.test(m)) return 'You don’t have permission to do that.';
  if (/fetch|network|Failed to fetch/i.test(m)) return 'No connection. Check your internet and try again.';
  return m || 'Something went wrong. Try again.';
}

/* ---------------------------------------------------------------- times (Pune is UTC+5:30 all year) */
function toIso(date, time) {
  return date && time ? date + 'T' + time + ':00+05:30' : null;
}
function ist(iso) {
  var d = new Date(new Date(iso).getTime() + 330 * 60000).toISOString();
  return { date: d.slice(0, 10), time: d.slice(11, 16) };
}
function nextDay(date) {
  var d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------- venues */
function addVenue(v) {
  if (VENUES[v.id]) return;
  VENUES[v.id] = {
    id: v.id,
    name: v.name,
    area: v.area,
    crowd: 'quiet',
    lat: v.lat,
    lng: v.lng,
    ic: v.icon || 'spotlight',
    hue: v.hue || 'violet',
    added: v.id.indexOf('v_') === 0
  };
}
export function pullVenues() {
  return db()
    .then((c) => c.from('venues').select('id, name, area, lat, lng, icon, hue'))
    .then(ok)
    .then((rows) => {
      rows.forEach(addVenue);
      return rows.length;
    });
}

/* a venue the organiser added on this phone: put it in the database, or use the one someone else added */
function ensureVenue(c, nv) {
  var xy = AREA_XY[nv.area] || [18.53, 73.87];
  return c
    .from('venues')
    .insert({ id: nv.id, name: nv.name, area: nv.area, lat: xy[0] + 0.0012, lng: xy[1] + 0.0012 })
    .then((r) => {
      if (!r.error) return nv.id;
      if (r.error.code !== '23505') throw r.error;
      // already there: either it's ours from an earlier save, or someone listed the same venue first
      return c
        .from('venues')
        .select('id, name, area')
        .ilike('name', nv.name)
        .ilike('area', nv.area)
        .then(ok)
        .then((rows) => (rows[0] ? rows[0].id : nv.id));
    });
}

/* ---------------------------------------------------------------- the signed-in user's organiser */
function profileFrom(org, links) {
  var ids = links
    .slice()
    .sort((a, b) =>
      a.venue_id === org.venue_id
        ? -1
        : b.venue_id === org.venue_id
          ? 1
          : a.created_at < b.created_at
            ? -1
            : 1
    )
    .map((l) => l.venue_id);
  return {
    remoteId: org.id,
    name: org.name,
    type: org.type,
    venueId: org.venue_id,
    venueIds: ids,
    customVenues: ids
      .filter((k) => VENUES[k] && VENUES[k].added)
      .map((k) => ({ id: k, name: VENUES[k].name, area: VENUES[k].area })),
    newVenue: null,
    insta: org.insta,
    phone: org.phone || '',
    status: org.status,
    since: org.created_at
  };
}
function nightFrom(r) {
  var s = ist(r.starts_at),
    e = r.ends_at ? ist(r.ends_at) : null;
  return {
    id: r.id,
    remote: true,
    title: r.title,
    kind: r.kind,
    sounds: r.sounds || [],
    family: r.family || '',
    genre: r.genre || '',
    energy: r.energy || '',
    soundsLike: r.sounds_like || [],
    date: s.date,
    start: s.time,
    end: e ? e.time : '',
    entry: r.entry,
    price: r.price != null ? String(r.price) : '',
    capacity: r.capacity != null ? String(r.capacity) : '',
    age: String(r.min_age),
    stag: r.stag_policy,
    dress: r.dress || '',
    about: r.about || '',
    poster: r.poster_url,
    venueId: r.venue_id,
    status: r.status === 'removed' ? 'draft' : r.status,
    updated: r.updated_at
  };
}

/* The user's organiser, their venues and their nights. Resolves null if they don't run one yet. */
export function pullMine() {
  var c;
  return db()
    .then((cl) => {
      c = cl;
      if (!me) return null;
      return c
        .from('organiser_members')
        .select('organiser_id, role')
        .eq('user_id', me)
        .is('removed_at', null)
        .eq('role', 'owner')
        .then(ok);
    })
    .then((mem) => {
      if (!mem || !mem.length) return null;
      var id = mem[0].organiser_id;
      return Promise.all([
        c.from('organisers').select('*').eq('id', id).single().then(ok),
        c.from('organiser_venues').select('venue_id, created_at').eq('organiser_id', id).then(ok),
        c
          .from('events')
          .select('*')
          .eq('organiser_id', id)
          .neq('status', 'removed')
          .order('starts_at')
          .then(ok)
      ]).then((x) => ({ profile: profileFrom(x[0], x[1]), events: x[2].map(nightFrom) }));
    });
}

/* Save the organiser profile and the venues they look after. Resolves the saved profile. */
export function pushProfile(pr) {
  var c, orgId;
  return db()
    .then((cl) => {
      c = cl;
      if (!me) throw new Error('Sign in again to save your profile.');
      // venues they added on this phone go in first, so the organiser can point at them
      return Promise.all((pr.customVenues || []).map((nv) => ensureVenue(c, nv).then((id) => [nv.id, id])));
    })
    .then((pairs) => {
      var swap = {};
      pairs.forEach((p2) => (swap[p2[0]] = p2[1]));
      var ids = orgVenueIds(pr).map((k) => swap[k] || k);
      pr = Object.assign({}, pr, { venueIds: ids, venueId: ids[0] });
      var row = {
        name: pr.name,
        type: pr.type,
        venue_id: pr.venueId,
        insta: pr.insta,
        phone: pr.phone || null
      };
      var q = pr.remoteId
        ? c.from('organisers').update(row).eq('id', pr.remoteId).select().single()
        : c.from('organisers').insert(row).select().single();
      return q.then(ok);
    })
    .then((org) => {
      orgId = org.id;
      return c
        .from('organiser_venues')
        .select('venue_id')
        .eq('organiser_id', orgId)
        .then(ok)
        .then((have) => {
          var had = have.map((x) => x.venue_id),
            want = pr.venueIds;
          var adds = want
              .filter((k) => had.indexOf(k) < 0)
              .map((k) => ({ organiser_id: orgId, venue_id: k, added_by: me })),
            drops = had.filter((k) => want.indexOf(k) < 0);
          return Promise.all([
            adds.length ? c.from('organiser_venues').insert(adds).then(ok) : null,
            drops.length
              ? c.from('organiser_venues').delete().eq('organiser_id', orgId).in('venue_id', drops).then(ok)
              : null
          ]);
        })
        .then(() => Object.assign({}, pr, { remoteId: orgId, status: org.status, since: org.created_at }));
    });
}

/* ---------------------------------------------------------------- nights */
function uploadPoster(c, orgId, dataUrl) {
  return fetch(dataUrl)
    .then((r) => r.blob())
    .then((blob) => {
      var path = orgId + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + '.jpg';
      return c.storage
        .from('posters')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
        .then(ok)
        .then(() => c.storage.from('posters').getPublicUrl(path).data.publicUrl);
    });
}

/* Save a night as a draft or send it for review. Resolves the saved night (with its database id). */
export function pushNight(o, status, pr) {
  var c;
  return db()
    .then((cl) => {
      c = cl;
      if (!me) throw new Error('Sign in again to save this night.');
      if (!pr.remoteId) throw new Error('Save your organiser profile first.');
      return o.poster && /^data:/.test(o.poster) ? uploadPoster(c, pr.remoteId, o.poster) : o.poster || null;
    })
    .then((poster) => {
      var ends = o.end ? toIso(o.end <= o.start ? nextDay(o.date) : o.date, o.end) : null; // after midnight = next day
      var row = {
        organiser_id: pr.remoteId,
        venue_id: o.venueId || pr.venueId,
        title: o.title,
        kind: o.kind,
        sounds: o.sounds || [],
        family: o.family || null,
        genre: o.genre || null,
        energy: o.energy || null,
        sounds_like: o.soundsLike || [],
        about: o.about || null,
        poster_url: poster,
        starts_at: toIso(o.date, o.start),
        ends_at: ends,
        entry: o.entry,
        price: o.entry === 'free' ? null : +o.price || null,
        capacity: +o.capacity || null,
        min_age: +o.age || 18,
        stag_policy: o.stag,
        dress: o.dress || null,
        status: status
      };
      function send(r) {
        return (
          o.remote
            ? c.from('events').update(r).eq('id', o.id).select().single()
            : c.from('events').insert(r).select().single()
        ).then(ok);
      }
      return send(row).catch((err) => {
        // a database that hasn't run the genres migration yet: save it the old way (genre names as sounds)
        if (!/schema cache|events_kind_check/.test((err && err.message) || '')) throw err;
        var old = Object.assign({}, row, {
          kind: legacyKind(row.kind),
          sounds: [o.genre || (family(o.family) || [])[1]].filter(Boolean).slice(0, 3)
        });
        ['family', 'genre', 'energy', 'sounds_like'].forEach((k) => delete old[k]);
        return send(old).then((saved) =>
          Object.assign(saved, {
            family: o.family,
            genre: o.genre,
            energy: o.energy,
            sounds_like: o.soundsLike,
            kind: o.kind
          })
        );
      });
    })
    .then(nightFrom);
}

/* Every live night from organisers on gathr, for the public feed. Resolves [{ night, host }]. */
export function pullFeed() {
  return db()
    .then((c) =>
      c
        .from('events')
        .select('*, organisers(name)')
        .eq('status', 'live')
        .gte('starts_at', new Date(Date.now() - 6 * 3600000).toISOString())
        .order('starts_at')
    )
    .then(ok)
    .then((rows) =>
      rows.map((r) => ({ night: nightFrom(r), host: (r.organisers && r.organisers.name) || '' }))
    );
}

/* ---------------------------------------------------------------- gathr admin: verify organisers, put nights live */
export function amAdmin() {
  return db()
    .then((c) => (me ? c.from('app_admins').select('user_id').eq('user_id', me).then(ok) : []))
    .then((r) => r.length > 0);
}
export function pullWaiting() {
  return db().then((c) =>
    Promise.all([
      c
        .from('organisers')
        .select('*, organiser_venues(venue_id)')
        .eq('status', 'pending')
        .order('created_at')
        .then(ok),
      c.from('events').select('*, organisers(name, insta)').eq('status', 'review').order('starts_at').then(ok)
    ]).then((x) => ({
      organisers: x[0],
      nights: x[1].map((r) => ({
        night: nightFrom(r),
        host: r.organisers ? r.organisers.name : '',
        insta: r.organisers ? r.organisers.insta : ''
      }))
    }))
  );
}
export function verifyOrganiser(id) {
  return db().then((c) =>
    c.from('organisers').update({ status: 'verified' }).eq('id', id).select('id').then(ok)
  );
}
export function decideNight(id, live) {
  return db().then((c) =>
    c
      .from('events')
      .update({ status: live ? 'live' : 'draft' })
      .eq('id', id)
      .select('id')
      .then(ok)
  );
}

/* ---------------------------------------------------------------- you: profile and bookings (step 3) */
/* Your private profile. Only the name reaches a host, on your bookings for their nights. */
export function pushMe(S) {
  var name = ((S.me && S.me.name) || '').trim().slice(0, 80);
  var row = {
    first_name: name.split(/\s+/)[0].slice(0, 40),
    full_name: name,
    phone: /^[6-9]\d{9}$/.test(S.phone || '') ? S.phone : null,
    age_band: ['18 to 20', '21 to 24', '25 or older'].indexOf(S.age) >= 0 ? S.age : null
  };
  return db().then((c) => {
    if (!me) return null;
    return c
      .from('profiles')
      .upsert(Object.assign({ id: me }, row))
      .then(ok);
  });
}

function bookingFrom(b) {
  return {
    id: b.id,
    event: b.event_id,
    code: b.code,
    couples: b.couples,
    stags: b.stags,
    girls: b.girls,
    guests: b.guests || 0, // guest-list people (free entry)
    passes: b.passes,
    amount: b.amount
  };
}
/* Book a gathr night: the database checks the night's rules (stags, capacity) and makes the pass code. */
export function book(eventId, couples, stags, girls, payRef) {
  return db()
    .then((c) =>
      c.rpc('create_booking', {
        ev: eventId,
        n_couples: couples,
        n_stags: stags,
        n_girls: girls,
        ref: null,
        pay_ref: payRef || null
      })
    )
    .then(ok)
    .then(bookingFrom);
}
export function cancelBooking(id) {
  return db()
    .then((c) => c.rpc('cancel_booking', { bk: id }))
    .then(ok);
}
/* Your bookings for nights that haven't ended, so passes follow you to another phone. */
export function pullMyBookings() {
  return db().then((c) => {
    if (!me) return [];
    return c
      .from('bookings')
      .select('*')
      .eq('user_id', me)
      .eq('status', 'booked')
      .order('created_at')
      .then(ok)
      .then((rows) => rows.map(bookingFrom));
  });
}
/* Who's coming to one of your nights (the night's team only). */
export function pullGuests(eventId) {
  return db()
    .then((c) => c.rpc('event_guests', { ev: eventId }))
    .then(ok)
    .then((rows) =>
      rows.map((g) => ({
        name: g.name,
        passes: g.passes,
        code: g.code, // empty for guest-list people who haven't taken their passes yet
        booked: g.guest_list
          ? 'Guest list · ' + g.guest_list + (g.code ? '' : ' · passes not taken yet')
          : g.via_promoter
            ? 'Through a promoter'
            : 'Booked on gathr',
        plusOnes: g.plus_ones || [],
        guestList: g.guest_list || null,
        bookingId: g.booking_id,
        entryId: g.entry_id || null,
        couples: g.couples,
        stags: g.stags,
        girls: g.girls
      }))
    );
}

/* ---------------------------------------------------------------- guest lists (step 4): free entry, named people */
/* Whose guest lists a night has (the host's, and promoters'): for "Whose list?" when booking. */
export function pullEventLists(eventId) {
  return db()
    .then((c) => c.rpc('event_guest_lists', { ev: eventId }))
    .then(ok)
    .then((rows) => rows.map((r) => ({ listId: r.list_id, owner: r.owner, isHost: r.is_host })));
}
/* The guest lists you're on (matched by the email you signed in with), for nights still to come. */
export function pullMyGuestLists() {
  return db().then((c) => {
    if (!me) return [];
    return c
      .rpc('my_guest_lists')
      .then(ok)
      .then((rows) =>
        rows.map((r) => ({
          entryId: r.entry_id,
          event: r.event_id,
          listId: r.list_id,
          owner: r.owner,
          plusOnes: r.plus_ones || [],
          bookingId: r.booking_id
        }))
      );
  });
}
/* Take your free passes from a list you're on. */
export function claimGuestList(eventId, listId) {
  return db()
    .then((c) => c.rpc('claim_guest_list', { ev: eventId, list: listId }))
    .then(ok)
    .then(bookingFrom);
}
/* Host: everyone on every guest list for one of their nights. */
export function pullListPeople(eventId) {
  return db().then((c) =>
    c
      .from('guest_list_entries')
      .select(
        'id, list_id, name, email, phone, plus_ones, note, booking_id, created_at, guest_lists(promoter_id, promoters(display_name))'
      )
      .eq('event_id', eventId)
      .is('removed_at', null)
      .order('created_at')
      .then(ok)
      .catch((e) => {
        // a database without phones on guest lists yet
        if (!/schema cache|phone/.test((e && e.message) || '')) throw e;
        return c
          .from('guest_list_entries')
          .select(
            'id, list_id, name, email, plus_ones, note, booking_id, created_at, guest_lists(promoter_id, promoters(display_name))'
          )
          .eq('event_id', eventId)
          .is('removed_at', null)
          .order('created_at')
          .then(ok);
      })
      .then((rows) => rows.map(entryFrom))
  );
}
/* the host's own list for a night: the one with no promoter and no invite (made the first time) */
function hostListId(c, eventId) {
  return c
    .from('guest_lists')
    .select('id')
    .eq('event_id', eventId)
    .is('promoter_id', null)
    .is('invite_email', null)
    .then(ok)
    .catch((e) => {
      // a database without promoter invites yet (migration 20261008110000)
      if (!/schema cache|invite_email/.test((e && e.message) || '')) throw e;
      return c.from('guest_lists').select('id').eq('event_id', eventId).is('promoter_id', null).then(ok);
    })
    .then((have) =>
      have.length
        ? have[0].id
        : c
            .from('guest_lists')
            .insert({ event_id: eventId })
            .select('id')
            .single()
            .then(ok)
            .then((l) => l.id)
    );
}
/* one guest on a list: a name, with their email, their phone, or neither */
function addEntry(c, listId, g) {
  var row = {
    list_id: listId,
    name: g.name,
    plus_ones: g.plusOnes || [],
    note: g.note || null,
    added_by: me
  };
  if (g.email) row.email = g.email;
  if (g.phone) row.phone = g.phone;
  return c.from('guest_list_entries').insert(row).select('id').single().then(ok);
}
/* Host: add someone to your own list for a night. */
export function addToHostList(eventId, guest) {
  return db().then((c) => hostListId(c, eventId).then((listId) => addEntry(c, listId, guest)));
}
/* Promoter: add someone to your list (the host's cap is checked by the database). */
export function addToList(listId, guest) {
  return db().then((c) => addEntry(c, listId, guest));
}
/* Host: every list on the night (yours, promoters', invites waiting), with people, cap and who came. */
export function pullListSummary(eventId) {
  return db()
    .then((c) => c.rpc('event_list_summary', { ev: eventId }))
    .then(ok)
    .then((rows) =>
      rows.map((r) => ({
        listId: r.list_id,
        owner: r.owner,
        isHost: r.is_host,
        waiting: r.waiting,
        email: r.invite_email,
        cap: r.cap,
        people: r.people,
        came: r.came
      }))
    );
}
/* Host: invite a promoter to one night by email, with a cap in people. */
export function invitePromoter(eventId, email, name, cap) {
  return db().then((c) =>
    c
      .from('guest_lists')
      .insert({ event_id: eventId, invite_email: email, invite_name: name || null, cap: cap || null })
      .select('id')
      .single()
      .then(ok)
  );
}
/* Host: withdraw an invite nobody has taken yet, or change a list's cap. */
export function withdrawInvite(listId) {
  return db().then((c) => c.from('guest_lists').delete().eq('id', listId).select('id').then(ok));
}
export function setListCap(listId, cap) {
  return db().then((c) =>
    c
      .from('guest_lists')
      .update({ cap: cap || null })
      .eq('id', listId)
      .select('id')
      .then(ok)
  );
}
/* Promoter: take the lists you were invited to (on sign-in), then the nights you're promoting. */
export function acceptPromoterLists() {
  return db().then((c) => (me ? c.rpc('accept_promoter_lists').then(ok) : 0));
}
export function myPromoterLists() {
  return db().then((c) => {
    if (!me) return [];
    return c
      .rpc('my_promoter_lists')
      .then(ok)
      .then((rows) =>
        rows.map((r) => ({
          listId: r.list_id,
          event: r.event_id,
          title: r.title,
          startsAt: r.starts_at,
          venue: r.venue,
          host: r.host,
          cap: r.cap,
          people: r.people,
          came: r.came
        }))
      );
  });
}
/* Promoter: the people on your list for a night. */
export function pullMyListPeople(listId) {
  return db().then((c) =>
    c
      .from('guest_list_entries')
      .select('id, list_id, name, email, phone, plus_ones, note, booking_id')
      .eq('list_id', listId)
      .is('removed_at', null)
      .order('created_at')
      .then(ok)
      .then((rows) => rows.map(entryFrom))
  );
}
function entryFrom(r) {
  return {
    id: r.id,
    listId: r.list_id,
    name: r.name,
    email: r.email || '',
    phone: r.phone || '',
    plusOnes: r.plus_ones || [],
    note: r.note || '',
    taken: !!r.booking_id,
    by: r.guest_lists && r.guest_lists.promoters ? r.guest_lists.promoters.display_name : null // null = your own list
  };
}
export function removeFromList(entryId) {
  return db()
    .then((c) =>
      c
        .from('guest_list_entries')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', entryId)
        .select('id')
    )
    .then(ok);
}

/* ---------------------------------------------------------------- the door (step 5) */
/* Every check-in for one of your nights, from every door phone. */
export function pullCheckins(eventId) {
  return db()
    .then((c) =>
      c
        .from('checkins')
        .select(
          'id, client_id, booking_id, guest_entry_id, guest_names, outcome, couples, stags, girls, scanned_at'
        )
        .eq('event_id', eventId)
        .order('scanned_at')
    )
    .then(ok);
}
/* Record one check-in. The database works out the credit and refuses anything the door's rules don't allow. */
export function sendCheckin(row) {
  return db()
    .then((c) => c.from('checkins').insert(row).select('id, scanned_at').single())
    .then(ok);
}
/* Undo a check-in: only the phone that recorded it, within 10 minutes. Resolves how many were undone. */
export function undoCheckins(ids) {
  return db()
    .then((c) => c.from('checkins').delete().in('id', ids).select('id'))
    .then(ok)
    .then((rows) => rows.length);
}

/* ---------------------------------------------------------------- notifications (step 6) */
/* This phone's push address, for the signed-in user (a shared phone moves to whoever signed in last). */
export function saveDevice(token, platform) {
  return db()
    .then((c) => (me ? c.rpc('save_device', { tok: token, plat: platform }) : { data: null }))
    .then(ok);
}
/* Your notifications, newest first (including ones sent to your email before you joined). */
export function pullInbox() {
  return db().then((c) => {
    if (!me) return [];
    return c
      .from('notifications')
      .select('id, kind, title, body, data, created_at, read_at')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(ok);
  });
}
export function markRead(ids) {
  if (!ids.length) return Promise.resolve();
  return db()
    .then((c) => c.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids))
    .then(ok);
}

/* ---------------------------------------------------------------- other cities: "Tell me when" */
export function myCities() {
  return db()
    .then((c) => (me ? c.from('city_interest').select('city').then(ok) : []))
    .then((r) => r.map((x) => x.city));
}
export function wantCity(city) {
  return db().then((c) =>
    c
      .from('city_interest')
      .upsert({ city: city }, { onConflict: 'user_id,city', ignoreDuplicates: true })
      .then(ok)
  );
}
export function cityCounts() {
  return db().then((c) => c.rpc('city_interest_counts').then(ok));
}

/* ---------------------------------------------------------------- "Suggest a new kind" of night (goes to gathr) */
export function suggestKind(name, example) {
  return db().then((c) => {
    if (!me) throw new Error('Sign in again to send this.');
    return c
      .from('kind_suggestions')
      .insert({ name: name, example: (example || '').slice(0, 90) || null })
      .then(ok);
  });
}
export function pullKindSuggestions() {
  return db().then((c) =>
    c
      .from('kind_suggestions')
      .select('id, name, example, created_at')
      .eq('status', 'new')
      .order('created_at')
      .then(ok)
  );
}
export function decideKind(id, added) {
  return db().then((c) =>
    c
      .from('kind_suggestions')
      .update({ status: added ? 'added' : 'declined' })
      .eq('id', id)
      .select('id')
      .then(ok)
  );
}
