/* A tappable area (card, row) that also works with the keyboard: Enter or Space acts like a tap. */
export function Tap({ onClick, ...props }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="tap"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e);
        }
      }}
      {...props}
    />
  );
}
