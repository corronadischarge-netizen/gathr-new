import { rowIcon } from '../ui/helpers';

/* Get ready: ID, dress code and closing-time tips for the night */
export function BeforeYouGoCard(p) {
  var e = p.e;
  var tips = [['id-card', e.idNote || 'ID on your phone: DigiLocker or the card']];
  tips.push([
    'shirt',
    e.dress ? 'Dress code: ' + e.dress.toLowerCase() : 'Dress code not listed. Smart casual is safe'
  ]);
  tips.push([
    'cup-soda',
    e.end ? 'Ends ' + e.end + ' · stay hydrated' : 'Last orders 1 am. Bars close at 1:30 am'
  ]);
  return (
    <div className="g-card card col" style={{ gap: '12px', padding: '16px 20px' }}>
      <span className="title15">Before you go</span>
      {tips.map((r) => (
        <div key={r[1]} className="rowc" style={{ gap: '12px' }}>
          {rowIcon(r[0])}
          <span className="body" style={{ fontSize: '15px', lineHeight: '20px', fontWeight: 300 }}>
            {r[1]}
          </span>
        </div>
      ))}
    </div>
  );
}
