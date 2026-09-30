import qrcode from 'qrcode-generator';

export function QRCode(p) {
  var q;
  try {
    q = qrcode(0, 'M');
    q.addData(p.text);
    q.make();
  } catch (err) {
    return <span className="meta">QR unavailable</span>;
  }
  var n = q.getModuleCount(),
    d = '';
  for (var r = 0; r < n; r++)
    for (var cc = 0; cc < n; cc++) if (q.isDark(r, cc)) d += 'M' + cc + ' ' + r + 'h1v1h-1z';
  return (
    <svg
      viewBox={'-2 -2 ' + (n + 4) + ' ' + (n + 4)}
      width={p.size}
      height={p.size}
      role="img"
      aria-label={p.label || 'Pass QR code'}
      shapeRendering="crispEdges"
      style={{ display: 'block', background: '#fff', borderRadius: '12px' }}
    >
      <path d={d} fill="#0a0a0a" />
    </svg>
  );
}
