import { EVENTS } from '../data/listings';
import { Badge, Button, IconButton } from '../design-system';
import { Share } from '../services/share';
import { eyebrow, i3, meta, note, stop } from '../ui/helpers';

/* Venue view: what a venue sees (for pitching) */
export function VenueDash(p) {
  var c = p.ctx,
    e = EVENTS.illegal;
  var stats = [
    ['184', 'booked via gathr this week'],
    ['83%', 'checked in at the door'],
    ['61%', 'booked as groups of 3+'],
    ['38%', 'repeat guests']
  ];
  var mix = [
    ['21–24', 46],
    ['25–29', 38],
    ['30+', 16]
  ];
  var places = [
    ['Pick of the week', 'Top card on This week', 'Labelled Promoted · needs a real crowd and rating'],
    ['Boosted in a mood row', 'Higher in Bollywood, Techno…', 'Must match the filter · 1 in 5 cards max'],
    [
      'Drop to followers',
      'Alert to people who follow you or the genre',
      'Max 2 a week · never to people it doesn’t fit'
    ],
    ['Map sticker', 'A bigger pin on the map', 'Labelled · never hides other venues']
  ];
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <Badge tone="neutral">Venue view · sample</Badge>
      </div>
      <div className="rel">
        {i3('spotlight', 88, 'head-ic bob')}
        {eyebrow('Kukoo · The Mills')}
        {stop('your week on gathr')}
      </div>
      <div className="dash-grid">
        {stats.map((s) => (
          <div key={s[1]} className="dash-stat">
            <span className="dash-n">{s[0]}</span>
            {meta(s[1])}
          </div>
        ))}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="g-section-title">Who’s coming</span>
        {mix.map((m) => (
          <div key={m[0]} className="rowc" style={{ gap: '12px' }}>
            <span className="meta" style={{ width: '48px' }}>
              {m[0]}
            </span>
            <div className="prog" style={{ flexGrow: 1 }}>
              <i style={{ width: m[1] + '%' }} />
            </div>
            <span className="meta" style={{ width: '36px', textAlign: 'right' }}>
              {m[1] + '%'}
            </span>
          </div>
        ))}
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Promote a night</span>
        <div className="promo-preview">
          <span className="promo-tag">Promoted</span>
          <div
            className="g-media thumb"
            style={{ width: '64px', height: '64px', backgroundImage: 'url(' + e.img + ')' }}
          />
          <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
            <span className="title15">{e.title}</span>
            {meta('Thu 1 Oct · Kukoo · ₹500')}
          </div>
        </div>
        {places.map((x) => (
          <div key={x[0]} className="col list-row" style={{ gap: '2px', alignItems: 'flex-start' }}>
            <span className="title15">{x[0]}</span>
            {meta(x[1])}
            <span className="guard">{x[2]}</span>
          </div>
        ))}
      </div>
      {note(
        'Every number here is sample data for pitching. Promoted content is always labelled and never overrides who gets in.'
      )}
      <Button
        variant="primary"
        size="lg"
        block
        onClick={() => Share.mail('Promoting a night on gathr', 'Venue:\nNight:\nPhone:\n')}
      >
        Email gathr about promotion
      </Button>
    </div>
  );
}
