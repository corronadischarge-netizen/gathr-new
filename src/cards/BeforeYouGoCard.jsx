import { tile } from '../ui/helpers';

/* Get ready: ID, dress code and closing-time tips for the night */
export function BeforeYouGoCard(p) {
  var e = p.e;
  var tips = [[['pass', 'blue'], e.idNote || 'ID on your phone: DigiLocker or the card']];
  tips.push([
    ['sunglasses', 'pink'],
    e.dress ? 'Dress code: ' + e.dress.toLowerCase() : 'Dress code not listed. Smart casual is safe'
  ]);
  tips.push([
    ['water', 'yellow'],
    e.end ? 'Ends ' + e.end + ' · stay hydrated' : 'Last orders 1 am. Bars close at 1:30 am'
  ]);
  return (
    <div className="g-card card col" style={{ gap: '12px', padding: '16px 20px' }}>
      <span className="title15">Before you go</span>
      {tips.map((r) => (
        <div key={r[1]} className="rowc" style={{ gap: '12px' }}>
          {tile(r[0][0], r[0][1], 40)}
          <span className="body" style={{ fontSize: '14px', lineHeight: '20px' }}>
            {r[1]}
          </span>
        </div>
      ))}
    </div>
  );
}
