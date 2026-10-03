export function HostBar(p) {
  var c = p.ctx,
    pr = c.S.org.profile || {};
  return (
    <div className="rowc between host-bar">
      <span className="host-pill">
        <i aria-hidden />
        {'Hosting · ' + pr.name}
      </span>
      <button type="button" className="link-btn" onClick={c.toGuest}>
        Switch to going out
      </button>
    </div>
  );
}
