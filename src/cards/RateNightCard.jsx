import { VENUES } from '../data/listings';
import { Button, Chip } from '../design-system';
import { meta, thumb } from '../ui/helpers';

/* Recap: rate the venue and follow the artist (or venue) for their next night */
export function RateNightCard(p) {
  var c = p.ctx,
    S = c.S,
    e = p.e,
    v = VENUES[e.venue],
    who = e.artist || v.name,
    f = !!S.follow[who];
  return (
    <div className="rel g-card card col" style={{ padding: '20px', gap: '16px' }}>
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 48)}
        <div className="col">
          <span className="title15">{e.title}</span>
          {meta(v.name + ' · ' + e.date)}
        </div>
      </div>
      <div className="hr" />
      <div className="col" style={{ gap: '10px' }}>
        <span className="g-section-title">{'How was ' + v.name + '?'}</span>
        <div className="wrap">
          {['Worth it', 'Too packed', 'Door was rough'].map((r) => (
            <Chip
              key={r}
              selected={S.rating === r}
              onClick={() => {
                c.set({ rating: r });
                c.toast('Thanks. It counts toward ' + v.name + '’s score');
              }}
            >
              {r}
            </Chip>
          ))}
        </div>
      </div>
      <div className="hr" />
      <div className="rowc" style={{ gap: '12px' }}>
        <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
          <span className="title15">{who}</span>
          {meta('Get told about their next night')}
        </div>
        <Button
          variant={f ? 'ghost' : 'subtle'}
          size="sm"
          onClick={() =>
            c.set((o) => {
              var x = Object.assign({}, o.follow);
              if (x[who]) delete x[who];
              else x[who] = 1;
              return { follow: x };
            })
          }
        >
          {f ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
}
