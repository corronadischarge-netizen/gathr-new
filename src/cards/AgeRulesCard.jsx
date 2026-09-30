import { icon } from '../ui/helpers';

/* What each age band means at Pune doors: [icon, colour, text] */
const INFO = {
  '18 to 20': [['x', 'var(--limit-text)', "We'll hide 21+ nights. 18+ club nights and gigs stay in."]],
  '21 to 24': [
    ['ticket', 'var(--go-text)', 'Beer and wine are fine at 21.'],
    ['x', 'var(--limit-text)', "Spirits are 25+ in Maharashtra. We'll flag 25+ venues."]
  ],
  '25 or older': [['ticket', 'var(--go-text)', 'Every door and every drink is open to you.']]
};

/* Age: the door rules for the age you picked, plus the ID reminder */
export function AgeRulesCard(p) {
  return (
    <div className="g-card card col fade-up" style={{ gap: '12px', padding: '18px 20px' }}>
      {INFO[p.age]
        .concat([
          ['user', 'var(--after-text)', 'Carry a government ID or DigiLocker. Photocopies are refused.']
        ])
        .map((r) => (
          <div key={r[2]} className="rule" style={{ alignItems: 'flex-start' }}>
            <span style={{ color: r[1], paddingTop: '1px' }}>{icon(r[0])}</span>
            <span className="body">{r[2]}</span>
          </div>
        ))}
    </div>
  );
}
