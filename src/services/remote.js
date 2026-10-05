import { VENUES } from '../data/listings';
import { AREA_XY, orgVenueIds } from '../data/organisers';
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
      var q = o.remote
        ? c.from('events').update(row).eq('id', o.id).select().single()
        : c.from('events').insert(row).select().single();
      return q.then(ok);
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
