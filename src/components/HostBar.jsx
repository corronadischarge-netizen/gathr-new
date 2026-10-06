import { useEffect } from 'react';
import { IconButton } from '../design-system';
import { openFrom } from '../services/push';
import { markRead } from '../services/remote';
import { i3, icon } from '../ui/helpers';

/* What gathr tells a host about their nights and profile. Shown in hosting mode: a bell with a count, and the
   newest unread one as a coloured card at the top of every hosting tab until it's opened or dismissed. */
export const HOST_KINDS = {
  night_rejected: ['megaphone', 'no'],
  night_back: ['megaphone', 'warn'],
  night_live: ['ticket', 'ok'],
  night_submitted: ['ticket', 'info'],
  verified: ['heart', 'ok'],
  promoter_joined: ['wristband', 'ok']
};

export function HostBar(p) {
  var c = p.ctx,
    S = c.S,
    pr = S.org.profile || {};
  var unread = (S.inbox || []).filter((n) => !n.read_at && HOST_KINDS[n.kind]),
    top = unread[0]; // the inbox is newest first
  // opening a hosting tab checks for news, at most once a minute
  useEffect(() => {
    if (S.signedIn && Date.now() - (S.inboxAt || 0) > 60000) c.set({ inboxAt: Date.now() });
  }, []);
  function read(ids) {
    c.set((o) => ({
      inbox: (o.inbox || []).map((n) => (ids.indexOf(n.id) >= 0 ? Object.assign({}, n, { read_at: 'now' }) : n))
    }));
    markRead(ids).catch(() => {});
  }
  return (
    <>
      <div className="rowc between host-bar">
        <span className="host-pill">
          <i aria-hidden />
          {'Hosting · ' + pr.name}
        </span>
        {/* switching back to going out lives on Profile, as the same card You uses to switch to hosting */}
        <span className={'bell' + (unread.length ? ' is-new' : '')}>
          <IconButton
            icon="bell"
            label={unread.length ? 'Updates, ' + unread.length + ' new' : 'Updates'}
            onClick={() => c.go('notifs', { notifSeen: true })}
          />
          {unread.length ? (
            <i key={unread.length} className="bell-count" aria-hidden>
              {unread.length > 9 ? '9+' : unread.length}
            </i>
          ) : null}
        </span>
      </div>
      {top ? (
        <div className={'host-notice is-' + HOST_KINDS[top.kind][1]} role="status">
          <button
            type="button"
            className="host-notice-main"
            onClick={() => {
              read([top.id]);
              openFrom(c, Object.assign({ kind: top.kind }, top.data));
            }}
          >
            <span className="host-notice-ic">{i3(HOST_KINDS[top.kind][0], 40)}</span>
            <span className="col host-notice-txt">
              <span className="title15">{top.title}</span>
              {top.body ? <span className="host-notice-body">{top.body}</span> : null}
              {unread.length > 1 ? (
                <span className="host-notice-more">{'+' + (unread.length - 1) + ' more in Updates'}</span>
              ) : null}
            </span>
          </button>
          <button type="button" className="host-notice-x" aria-label="Dismiss" onClick={() => read([top.id])}>
            {icon('x', 18)}
          </button>
        </div>
      ) : null}
    </>
  );
}
