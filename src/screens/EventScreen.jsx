import { useRef } from 'react';
import { APP_URL } from '../config';
import { MO, WD } from '../data/dates';
import { kindOf } from '../data/eventKind';
import { blockedFor, rupees } from '../data/format';
import { KINDS, stagTxt } from '../data/organisers';
import { Badge, Button, IconButton } from '../design-system';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { fav, friendsTxt, i3, icon, note, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function EventScreen(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven,
    saved = !!S.saved[e.id],
    blocked = blockedFor(e, S.age);
  var onThis = S.planned === e.id;
  var cta = e.rsvp ? 'RSVP' : e.src === 'district' || (e.org && !e.door) ? 'Get tickets' : 'Get on the list';
  var kind = e.org ? (KINDS.filter((k) => k[0] === e.kindKey)[0] || KINDS[0]).slice(1) : kindOf(e),
    sounds = e.genre
      .split(',')
      .map((x) => {
        x = x.trim();
        return x.charAt(0).toUpperCase() + x.slice(1);
      })
      .filter((x) => x && !/themed party|girls|club night|live gig/i.test(x));
  var d = new Date(e.iso),
    dayShort = WD[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MO[d.getMonth()];
  /* door check in one line: what's certain, what isn't */
  var unknown = e.org ? 0 : 1 + (e.dress ? 1 : 0);
  var verdict = blocked
    ? ['Not for you', 'limit']
    : unknown
      ? ['Check ' + unknown + (unknown === 1 ? ' thing' : ' things'), 'now']
      : ['Confirmed', 'go'];
  // when the verdict changes (your age was just set), its words fade in while the badge colour shifts
  var lastVerdict = useRef({ v: verdict[0], at: 0 });
  if (lastVerdict.current.v !== verdict[0]) lastVerdict.current = { v: verdict[0], at: Date.now() };
  var verdictChanged = Date.now() - lastVerdict.current.at < 400;
  var doorLine = blocked
    ? 'This night is ' + e.age + '+. You’re ' + S.age + '.'
    : e.org
      ? ['ID for everyone', stagTxt(e.stag)].concat(e.dress ? [e.dress.toLowerCase()] : []).join(' · ')
      : 'ID for everyone · stag entry is up to the door' + (e.dress ? ' · ' + e.dress.toLowerCase() : '');
  function fact(label, value, sub, tone) {
    return (
      <div className={'ev-fact' + (tone ? ' is-' + tone : '')} role="listitem">
        <span className="ev-lbl">{label}</span>
        <span className="ev-val">{value}</span>
        {sub ? <span className="ev-sub">{sub}</span> : null}
      </div>
    );
  }
  return (
    <div className="col full ev-page">
      {/* 1 · hero: poster (tap for the full one), kind of night, name, venue, sound */}
      <div className="ev-hero">
        <button
          type="button"
          className="g-media ev-hero-img"
          aria-label="See the full poster"
          style={{ backgroundImage: 'url(' + e.img + ')' }}
          onClick={() => c.set({ sheet: 'poster' })}
        >
          <span className="g-grain" style={{ opacity: 0.16 }} />
          <div className="img-fade" />
        </button>
        <div className="rowc ev-topbar">
          <IconButton icon="arrow-left" label="Back" variant="scrim" onClick={c.back} />
          <span style={{ flexGrow: 1 }} />
          <IconButton
            icon="share"
            label="Share this night"
            variant="scrim"
            onClick={() =>
              Share.link(
                e.title,
                e.title + ' · ' + v.name + ' · ' + e.date + ' ' + e.time + ' on gathr',
                APP_URL + '#e=' + e.id
              ).then(
                (r) => {
                  var t = shareToast(r, 'Link');
                  if (t) c.toast(t);
                },
                () => {
                  c.toast('Couldn’t share. Try again');
                }
              )
            }
          />
          <IconButton
            icon="users"
            label="Plan with friends"
            variant="scrim"
            onClick={() =>
              c.go('newplan', {
                draft: {
                  opts: [e.id],
                  deadline: 'Thu 6 pm',
                  name: e.day === 'fri' ? 'Friday plan' : 'Night out'
                }
              })
            }
          />
          <IconButton
            icon="heart"
            label={saved ? 'Saved' : 'Save'}
            variant="scrim"
            active={saved}
            onClick={() => c.toggleSave(e.id)}
          />
        </div>
        <div className="ev-hero-copy">
          <div className="rowc" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <span className="ev-kind">
              {i3(kind[1], 26)}
              {kind[0]}
            </span>
            {onThis ? <Badge tone="go">You’re booked</Badge> : null}
          </div>
          <h1 className="g-display disp ev-title">{e.title}</h1>
          <p className="ev-hero-meta">
            <b>{v.name}</b>
            {' · ' + v.area.split(',')[0]}
          </p>
          {sounds.length ? <p className="ev-sound">{sounds.join(' · ')}</p> : null}
          {e.about ? (
            <p className="ev-sound" style={{ color: 'var(--ink)' }}>
              {e.about}
            </p>
          ) : null}
        </div>
      </div>
      <div className="px col ev-body">
        {/* 2 · the three answers people look for first */}
        <div className="ev-facts" role="list" aria-label="At a glance">
          {fact(
            'When',
            dayShort,
            e.time + (e.end ? ' – ' + e.end : ' onwards') + (e.gates ? ' · gates ' + e.gates : '')
          )}
          {fact(
            'Age',
            e.age ? e.age + '+' : '18+',
            blocked ? 'not for you' : 'bring ID',
            blocked ? 'limit' : null
          )}
        </div>
        {e.org && e.host ? (
          <p className="meta" style={{ margin: '-8px 0 0' }}>
            {'Hosted by ' + e.host + ' · listed on gathr'}
          </p>
        ) : null}
        {/* 3 · who's going (only when friends are) */}
        {e.nFriends ? (
          <button
            type="button"
            className="friends-btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => c.set({ sheet: 'friends' })}
          >
            <span className="mini-crew">{(e.friends || []).slice(0, 3).map((f) => fav(f, 28))}</span>
            {friendsTxt(e.nFriends)}
            {icon('chevron-right', 16)}
          </button>
        ) : null}
        {/* 4 · door check and venue: two tappable rows, details one tap away */}
        <div className="ev-card col ev-rows">
          <button type="button" className="ev-row" onClick={() => c.set({ sheet: 'rules' })}>
            <span className="ev-row-ic">{i3('pass', 40)}</span>
            <span className="col" style={{ gap: '4px', flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
              <span className="rowc" style={{ gap: '8px' }}>
                <span className="title15">Who gets in</span>
                <Badge tone={verdict[1]}>
                  <span key={verdict[0]} className={verdictChanged ? 'swap-in' : undefined}>
                    {verdict[0]}
                  </span>
                </Badge>
              </span>
              <span className="meta">{doorLine}</span>
            </span>
            {icon('chevron-right')}
          </button>
          <div className="ev-divider" />
          <div className="rowc" style={{ gap: '8px' }}>
            <Tap
              onClick={() => c.go('venue')}
              className="tap ev-row"
              style={{ flexGrow: 1 }}
              aria-label={v.name + ', ' + v.area + '. Open venue'}
            >
              {tile(v.ic, v.hue, 40)}
              <span className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                <span className="title15">{v.name}</span>
                <span className="meta">{v.area.split(',')[0] + ' · closes 1:30 am'}</span>
              </span>
            </Tap>
            <IconButton
              icon="navigation"
              label={'Directions to ' + v.name}
              variant="solid"
              onClick={() => Share.directions(v)}
            />
          </div>
        </div>
        {note('Friends are sample data. Tap the poster to see it in full.')}
      </div>
      {/* 5 · the decision: price on the left, one action on the right */}
      <div className="bottom ev-bar">
        {onThis ? (
          <Button variant="primary" size="lg" block icon="ticket" onClick={() => c.go('pass')}>
            You're in · show pass
          </Button>
        ) : (
          <div className="rowc" style={{ gap: '14px' }}>
            <div className="col ev-price">
              <span className="ev-price-n">
                {e.rsvp
                  ? 'Free'
                  : e.door
                    ? e.price
                      ? rupees(e.price)
                      : 'At door'
                    : e.price == null
                      ? 'At door'
                      : rupees(e.price)}
              </span>
              <span className="meta">
                {e.rsvp
                  ? 'with RSVP'
                  : e.door
                    ? 'at the door'
                    : e.price == null
                      ? 'price not listed'
                      : 'per person'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <Button
                variant="brand"
                size="lg"
                block
                icon="ticket"
                disabled={blocked}
                onClick={() => c.book()}
              >
                {blocked ? e.age + '+ only' : cta}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
