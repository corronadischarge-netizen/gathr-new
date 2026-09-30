export function Switch(p) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={p.on}
      aria-label={p.label}
      className={'switch' + (p.on ? ' on' : '')}
      onClick={p.onClick}
    >
      <span />
    </button>
  );
}
