import { IconButton } from '../design-system';

export function OrgBack(p) {
  return (
    <div className="rowc between">
      <IconButton icon="arrow-left" label="Back" variant="solid" onClick={p.c.back} />
      {p.right || <span style={{ width: '48px' }} />}
    </div>
  );
}
