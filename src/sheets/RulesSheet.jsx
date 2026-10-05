import { blockedFor, priceTxt, srcName } from '../data/format';
import { stagTxt } from '../data/organisers';
import { Badge, Button, Sheet } from '../design-system';
import { Share } from '../services/share';
import { icon, meta } from '../ui/helpers';

/* Who gets in: every door rule for the night, and which ones the organiser didn't list */
export function RulesSheet(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven;
  var blocked = blockedFor(e, S.age);
  var rows = [
    [
      'user',
      'Age',
      e.allAges
        ? 'Open to all ages.'
        : e.age
          ? e.age + '+ to enter.' + (e.age >= 21 ? ' Spirits 25+ by law.' : '')
          : null
    ],
    ['user', 'ID', e.idNote || 'Government ID or DigiLocker (Pune rule)'],
    ['ticket', 'Entry', priceTxt(e) + (e.price ? ' per person' : '')],
    ['sparkles', 'Dress code', e.dress || (e.org ? 'No dress code' : null)],
    ['users', 'Groups and couples', e.org ? stagTxt(e.stag) : null],
    [
      'clock',
      'Hours',
      e.end
        ? e.time + ' till ' + e.end + '. Pune bars close at 1:30 am.'
        : 'Starts ' + e.time + '. Pune bars close at 1:30 am.'
    ]
  ];
  if (e.noReentry) rows.push(['x', 'Re-entry', 'Not allowed once you exit']);
  var missing = rows.filter((r) => !r[2]).length;
  return (
    <Sheet
      title="Who gets in"
      subtitle={
        e.title + (e.org ? ' · set by ' + (e.host || 'the host') : ' · from the ' + srcName(e) + ' listing')
      }
      onClose={p.close}
    >
      <div className="rowc group-check" style={{ gap: '12px' }}>
        <Badge tone={blocked ? 'limit' : missing ? 'now' : 'go'}>
          {blocked ? 'Not for you' : missing ? 'Check first' : "You're good"}
        </Badge>
        {meta(
          blocked
            ? 'This night is 21+. You told us you’re 18 to 20'
            : missing
              ? missing +
                (missing === 1 ? ' rule isn’t' : ' rules aren’t') +
                ' on the listing. Check before you go'
              : 'Every rule is on the listing'
        )}
      </div>
      <div className="col">
        {rows.map((r) => (
          <div key={r[1]} className="rule" style={{ padding: '10px 0', alignItems: 'flex-start' }}>
            <span className="muted" style={{ paddingTop: '1px' }}>
              {icon(r[0])}
            </span>
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{r[1]}</span>
              {meta(r[2] || 'Not listed by the organiser')}
            </div>
            {r[2] ? null : <Badge tone="neutral">Unknown</Badge>}
          </div>
        ))}
      </div>
      {!blocked ? (
        <Button variant="primary" size="lg" block onClick={() => c.book()}>
          {e.rsvp ? 'RSVP' : e.src === 'district' ? 'Get tickets' : 'Get on the list'}
        </Button>
      ) : null}
      <Button
        variant="ghost"
        block
        onClick={() =>
          Share.mail(
            'Door rules for ' + e.title + ' at ' + v.name,
            'Please check the door rules for ' +
              e.title +
              ' (' +
              e.date +
              ') at ' +
              v.name +
              '. Missing on the listing: ' +
              rows
                .filter((r) => !r[2])
                .map((r) => r[1])
                .join(', ') +
              '.'
          )
        }
      >
        Ask gathr to check with the venue
      </Button>
      {e.org ? null : (
        <a
          className="rule-link"
          style={{ justifyContent: 'center', fontSize: '13px', color: 'var(--ink-muted)' }}
          href={e.url}
          target="_blank"
          rel="noopener"
        >
          {'Open the listing on ' + srcName(e)}
          {icon('arrow-up-right', 16)}
        </a>
      )}
    </Sheet>
  );
}
