/* Friends: the three rules of how friends are added and what they can see */
export function HowFriendsWorkCard() {
  return (
    <div className="g-card card col" style={{ gap: '12px', padding: '16px 18px' }}>
      <span className="title15">How friends work</span>
      {[
        ['1', 'You add each other: from contacts, a plan link or a QR code at the venue.'],
        ['2', 'Friends see the nights you’ve booked. That’s how "3 friends going" works.'],
        ['3', 'Nobody sees where you are. gathr never shares your location.']
      ].map((r) => (
        <div key={r[0]} className="rowc" style={{ gap: '12px', alignItems: 'flex-start' }}>
          <span className="num-dot">{r[0]}</span>
          <span className="body" style={{ fontSize: '14px', lineHeight: '20px' }}>
            {r[1]}
          </span>
        </div>
      ))}
    </div>
  );
}
