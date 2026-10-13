import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useOnline } from '../hooks/useOnline';
import { AuthForm } from '../components/AuthForm';
import { Switch } from '../components/Switch';
import { rupees } from '../data/format';
import { doorOf } from '../data/doorRules';
import { groupFor, tryInstead } from '../data/homeData';
import { isSet } from '../data/group';
import { EVENTS } from '../data/listings';
import { now } from '../lib/clock';
import { MAX_TRIES, inFlight } from '../lib/booking';
import { getDoorVerdict, verdictText } from '../lib/door';
import { Button, Chip, Sheet } from '../design-system';
import { haptic } from '../lib/haptics';
import { poss } from '../lib/utils';
import { Pay } from '../services/payments';
import { claimGuestList, pullEventLists, pullMyGuestLists, remoteOn, sayError } from '../services/remote';
import { icon, meta, svgIcon } from '../ui/helpers';

/* One-sheet booking: guests, rules, price, pay (and sign-in, first time only).
   It runs on the booking state machine (lib/booking.js, interactions spec 7), kept in the app's state (S.bk):
   selecting → (codeSent → codeEntry →) selecting → paying → success | failed | pending, and blocked when the door
   says no for this group. The sheet only shows the state and sends events; the app does the paying. */
export function BookSheet(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven;
  var gpb = S.gp && S.gpBook === e.id,
    crew = gpb ? ['Riya'].concat(S.gp.members) : null;
  /* A night hosted on gathr is booked in the database, which needs the party: couples, guys and girls.
     That's how the night's stag rule and promoter pay work. Listed nights keep a simple pass count. */
  var dbNight = remoteOn && e.remote && !gpb;
  const [party, setParty] = useState({ couples: 1, stags: 0, girls: 0 });
  const [hitMax, setHitMax] = useState(false); // tried to go past the host's limit: say why
  const [freeing, setFreeing] = useState(false); // a free booking is on its way (in-flight guard)
  var online = useOnline(); // offline: Pay and the guest list wait, and say why (spec 2.6)
  var partyErr =
    e.stag === 'groups' && party.stags > 0 && !party.couples && !party.girls
      ? 'This night is couples and mixed groups only. Add a couple or a girl'
      : null;
  /* Guest list: free entry for people the host or a promoter added by name. No requests: you pick whose
     list you're on, and you're either on it (free passes for you and your named plus-ones) or told to ask. */
  const [lists, setLists] = useState([]);
  const [mode, setMode] = useState(S.bookMode === 'guest' ? 'guest' : 'buy');
  const [pick, setPick] = useState(S.bookList || null);
  const [claiming, setClaiming] = useState(false);
  useEffect(() => {
    if (!dbNight) return;
    pullEventLists(e.id).then(setLists, () => setLists([]));
    if (S.signedIn) refreshMine();
  }, [e.id, S.signedIn]);
  // opened from a guest-list update: that choice is used once, not for the next night you open
  useEffect(() => {
    if (S.bookMode || S.bookList) c.set({ bookMode: null, bookList: null });
  }, []);
  function refreshMine() {
    return pullMyGuestLists()
      .then((l) => c.set({ myGuestLists: l }))
      .catch(() => {});
  }
  var onMine = (S.myGuestLists || []).filter((x) => x.event === e.id),
    chosen = pick || (onMine[0] && onMine[0].listId) || (lists.length === 1 ? lists[0].listId : null),
    chosenList = lists.filter((l) => l.listId === chosen)[0],
    entry = onMine.filter((x) => x.listId === chosen)[0];
  var guestMode = dbNight && lists.length > 0 && mode === 'guest';
  function claim() {
    if (claiming || !entry) return;
    setClaiming(true);
    claimGuestList(e.id, chosen).then(
      (b) => {
        setClaiming(false);
        c.set((o) => ({
          guests: b.passes,
          celebrate: 'gl_' + b.id,
          onList: true,
          planned: e.id,
          sheet: null,
          stack: o.stack.concat('pass'),
          dir: 'fwd',
          myBookings: Object.assign({}, o.myBookings, { [e.id]: Object.assign({}, b, { listOwner: entry.owner, plusOnes: entry.plusOnes }) })
        }));
      },
      (err) => {
        setClaiming(false);
        haptic.error();
        c.toast(sayError(err));
      }
    );
  }

  /* the door for this group (home v3 5.8): the host's limit per booking, the condition line, or a no */
  var t = now(),
    door = doorOf(e),
    maxPasses = door.maxPasses || 6,
    group = groupFor(S, t),
    capped = isSet(group) && group.size > maxPasses,
    verdict = getDoorVerdict(door, group, S.age, t),
    no = verdict.state === 'no',
    condition = verdict.state === 'if' ? verdictText(verdict, group, 'line').text : null;

  /* the machine: this night's booking, or another night's that is still paying */
  var bk = S.bk && S.bk.ev === e.id ? S.bk : null,
    st = bk ? bk.state : 'idle',
    busyElsewhere = inFlight(S.bk) && S.bk.ev !== e.id ? EVENTS[S.bk.ev] : null,
    moving = inFlight(bk),
    auth = st === 'codeSent' || st === 'codeEntry';
  useLayoutEffect(() => {
    c.bkOpen(e.id, no);
  }, []);
  // the group changed while the sheet was open: a no blocks Pay, a yes unblocks it
  useEffect(() => {
    if ((st === 'selecting' || st === 'failed') && no) c.bkSend('BLOCK');
    else if (st === 'blocked' && !no) c.bkSend('REGROUP');
  }, [no, st]);
  // the content slides to sign-in and back (spec 4: one sheet, content swaps with a horizontal slide)
  var wasAuth = useRef(auth),
    slide = auth !== wasAuth.current ? (auth ? 'w-next' : 'w-prev') : '';
  useEffect(() => {
    wasAuth.current = auth;
  });

  var n = gpb ? crew.length : dbNight ? party.couples * 2 + party.stags + party.girls : S.guests,
    each = e.door ? 0 : e.price || 0,
    gross = each * n;
  const [useCredit, setUseCredit] = useState(false);
  // the pass count rolls up or down to its new number, and the total rolls with it
  var lastN = useRef(n),
    rollDir = useRef('');
  if (n !== lastN.current) {
    rollDir.current = n > lastN.current ? 'roll-up' : 'roll-down';
    lastN.current = n;
  }
  var roll = rollDir.current;
  var credit = each && S.credit > 0 && useCredit ? Math.min(S.credit, gross) : 0,
    total = gross - credit;
  var payLabel = e.rsvp
    ? 'Get on the list · ' + n
    : each
      ? total
        ? 'Pay ' + rupees(total)
        : 'Book with credit'
      : 'Get on the list';

  /* passes: the number changes and the machine hears about it (selecting stays selecting; after a failed payment,
     changing your passes starts again from selecting) */
  function changed() {
    if (st === 'failed' || st === 'selecting') c.bkSend('PASSES');
  }
  function setGuests(k) {
    c.set({ guests: k });
    changed();
  }
  /* Pay: signed out, the sheet slides to sign-in first; free nights skip paying; otherwise the app pays, once */
  function payTap() {
    if (partyErr || n < 1 || moving || st === 'blocked' || !online) return;
    if (!S.signedIn) {
      c.bkSend('PAY_SIGNED_OUT');
      return;
    }
    var info = {
      n: n,
      total: total,
      credit: credit,
      gpb: !!gpb,
      party: party,
      dbNight: !!dbNight,
      title: e.title + ' · ' + n + (n === 1 ? ' pass' : ' passes')
    };
    if (!total) {
      if (freeing) return;
      setFreeing(true);
      c.bookFree(info).then(() => setFreeing(false));
      return;
    }
    c.pay(info);
  }

  var tryNight = no ? tryInstead(S, e, t) : null;

  if (busyElsewhere)
    return (
      <Sheet title={e.title} subtitle={v.name + ' · ' + e.date + ' · ' + e.time} onClose={c.closeSheet}>
        <p className="meta" style={{ margin: 0 }}>
          {'Your booking for ' + busyElsewhere.title + ' is still going through'}
        </p>
        <Button variant="primary" size="lg" block onClick={() => c.set({ cur: S.bk.ev })}>
          Show it
        </Button>
      </Sheet>
    );

  return (
    <Sheet
      title={e.title}
      subtitle={v.name + ' · ' + e.date + ' · ' + e.time}
      onClose={c.closeSheet}
      dismissible={!moving}
    >
      {auth ? (
        /* sign in first (codeSent → codeEntry); everything chosen waits on the other side */
        <div key="auth" className={'col bk-pane ' + slide} style={{ gap: '12px' }}>
          <button type="button" className="link-btn bk-back" onClick={() => c.bkSend('BACK')}>
            {icon('arrow-left', 20)}
            <span>{'Back to your ' + (n === 1 ? 'pass' : 'passes')}</span>
          </button>
          <span className="title15">Sign in to keep your passes</span>
          <AuthForm
            ctx={c}
            id="bk"
            compact
            payIcon
            emailLabel="Email, for your passes and receipt"
            verifyLabel="Verify"
            maxTries={MAX_TRIES}
            resume={{ cur: e.id, guests: n }}
            onSent={(again) => c.bkSend(again ? 'RESEND' : 'CODE_SENT')}
            onWrong={() => c.bkSend('WRONG')}
            onChangeEmail={() => c.bkSend('CHANGE_EMAIL')}
            onDone={() => c.bkSend('RIGHT')}
          />
        </div>
      ) : (
        <div key="main" className={'col bk-pane ' + slide} style={{ gap: '16px' }}>
          {dbNight && lists.length ? (
            <div className="seg" role="radiogroup" aria-label="How you’re coming">
              {[
                ['buy', 'Buy passes'],
                ['guest', 'Guest list']
              ].map((x) => (
                <button
                  key={x[0]}
                  type="button"
                  role="radio"
                  aria-checked={mode === x[0]}
                  className={mode === x[0] ? 'on' : ''}
                  disabled={moving}
                  onClick={() => setMode(x[0])}
                >
                  {x[1]}
                </button>
              ))}
            </div>
          ) : null}
          {guestMode ? (
            <div className="col" style={{ gap: '12px' }}>
              <span className="title16">Whose guest list are you on?</span>
              <div className="wrap" role="radiogroup" aria-label="Whose guest list">
                {lists.map((l) => (
                  <Chip
                    key={l.listId}
                    role="radio"
                    aria-checked={chosen === l.listId}
                    selected={chosen === l.listId}
                    onClick={() => setPick(l.listId)}
                  >
                    {l.isHost ? l.owner + ' (host)' : l.owner}
                  </Chip>
                ))}
              </div>
              {!S.signedIn ? (
                <div className="col" style={{ gap: '8px' }}>
                  <span className="title15">Sign in to check the list</span>
                  {meta('Use the email the host or promoter added you with')}
                  <AuthForm ctx={c} id="gl" compact emailLabel="Your email" onDone={() => setTimeout(refreshMine, 0)} />
                </div>
              ) : !chosen ? (
                meta('Pick whose list you’re on')
              ) : entry ? (
                <div className="g-card card col" style={{ gap: '6px', padding: '16px 18px' }}>
                  <span className="title16">{'You’re on ' + poss(chosenList.owner) + ' list'}</span>
                  {meta(['You'].concat(entry.plusOnes).join(', '))}
                  {meta(
                    'Free entry · ' +
                      (1 + entry.plusOnes.length) +
                      (entry.plusOnes.length ? ' passes' : ' pass') +
                      ' · door rules still apply'
                  )}
                </div>
              ) : (
                <p className="meta err-txt" role="alert" style={{ margin: 0 }}>
                  {'You’re not on ' +
                    (chosenList ? poss(chosenList.owner) : 'this') +
                    ' list for this night. Ask them to add ' +
                    (S.email || 'your email') +
                    ', or buy a pass'}
                </p>
              )}
              {S.signedIn && chosen ? (
                entry ? (
                  <Button variant="primary" size="lg" block icon="ticket" busy={claiming} disabled={!online} onClick={claim}>
                    {claiming ? 'Getting your passes' : entry.bookingId ? 'Show my passes' : 'Get free passes'}
                  </Button>
                ) : (
                  <Button variant="subtle" block onClick={() => setMode('buy')}>
                    Buy passes instead
                  </Button>
                )
              ) : null}
            </div>
          ) : dbNight ? (
            <div className="col" style={{ gap: '4px' }}>
              {[
                ['couples', 'Couples', '2 passes each'],
                ['stags', 'Guys', e.stag === 'none' ? 'No stag entry tonight' : 'Coming without a partner'],
                ['girls', 'Girls', '1 pass each']
              ].map((r) => {
                var k = r[0],
                  val = party[k],
                  closed = k === 'stags' && e.stag === 'none',
                  room = n + (k === 'couples' ? 2 : 1) <= 20;
                return (
                  <div key={k} className="rowc between party-row" style={{ gap: '12px' }}>
                    <div className="col" style={{ gap: '2px' }}>
                      <span className="title15">{r[1]}</span>
                      {meta(r[2])}
                    </div>
                    <div className="rowc" style={{ gap: '16px' }}>
                      <button
                        type="button"
                        className="g-ibtn g-ibtn-solid step"
                        aria-label={'One fewer: ' + r[1]}
                        disabled={moving}
                        onClick={() => {
                          if (val <= 0) return haptic.warning();
                          haptic.tap();
                          setParty(Object.assign({}, party, { [k]: val - 1 }));
                          changed();
                        }}
                      >
                        {svgIcon(['M5 12h14'])}
                      </button>
                      <span key={val} className={'step-n ' + roll} aria-live="polite" aria-label={val + ' ' + r[1]}>
                        {val}
                      </span>
                      <button
                        type="button"
                        className="g-ibtn g-ibtn-solid step"
                        aria-label={'One more: ' + r[1]}
                        disabled={closed || moving}
                        onClick={() => {
                          if (!room) return haptic.warning();
                          haptic.tap();
                          setParty(Object.assign({}, party, { [k]: val + 1 }));
                          changed();
                        }}
                      >
                        {svgIcon(['M5 12h14', 'M12 5v14'])}
                      </button>
                    </div>
                  </div>
                );
              })}
              {meta(n + (n === 1 ? ' pass' : ' passes') + (n > 1 ? ' · send the others theirs after' : ''))}
              {partyErr ? (
                <p className="meta err-txt" role="alert" style={{ margin: 0 }}>
                  {partyErr}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rowc between" style={{ gap: '12px' }}>
              <div className="col" style={{ gap: '2px' }}>
                <span className="title16">Passes</span>
                {meta(gpb ? 'One each for your group' : n === 1 ? 'Just you' : 'You + ' + (n - 1) + ' · send theirs after')}
              </div>
              {gpb ? (
                <span className="step-n">{n}</span>
              ) : (
                <div className="rowc" style={{ gap: '16px' }}>
                  <button
                    type="button"
                    className="g-ibtn g-ibtn-solid step"
                    aria-label="One fewer pass"
                    disabled={moving}
                    onClick={() => {
                      // at a limit nothing changes and the phone gives a warning buzz (interactions spec 5)
                      if (n <= 1) return haptic.warning();
                      haptic.tap();
                      setGuests(n - 1);
                    }}
                  >
                    {svgIcon(['M5 12h14'])}
                  </button>
                  <span key={n} className={'step-n ' + roll} aria-live="polite" aria-label={n + (n === 1 ? ' pass' : ' passes')}>
                    {n}
                  </span>
                  <button
                    type="button"
                    className="g-ibtn g-ibtn-solid step"
                    aria-label="One more pass"
                    disabled={moving}
                    onClick={() => {
                      if (n >= maxPasses) {
                        setHitMax(true);
                        return haptic.warning();
                      }
                      haptic.tap();
                      setGuests(n + 1);
                    }}
                  >
                    {svgIcon(['M5 12h14', 'M12 5v14'])}
                  </button>
                </div>
              )}
            </div>
          )}
          {guestMode ? null : (
            <>
              {capped || hitMax ? meta('Max ' + maxPasses + ' passes per booking') : null}
              {condition ? (
                <p className="bk-cond" style={{ margin: 0 }}>
                  {condition + ". Make sure everyone's sorted"}
                </p>
              ) : null}
              {e.door && e.price ? meta('Cover ' + rupees(e.price) + ' at the door') : null}
              {each && S.credit > 0 && S.signedIn ? (
                <div className="rowc between" style={{ gap: '12px' }}>
                  <div className="col" style={{ gap: '2px' }}>
                    <span className="title15">Use planner credit</span>
                    {meta(rupees(S.credit) + ' available')}
                  </div>
                  <Switch
                    on={useCredit}
                    label="Use planner credit"
                    onClick={() => {
                      if (moving) return;
                      setUseCredit(!useCredit);
                      changed();
                    }}
                  />
                </div>
              ) : null}
              <div className="rowc between total-row">
                <span className="title15">
                  {e.rsvp ? 'Free with RSVP' : each ? (credit ? 'Total after ' + rupees(credit) + ' credit' : 'Total') : 'Pay at the door'}
                </span>
                <span key={total} className={'price-big ' + roll}>
                  {e.rsvp ? '₹0' : each ? rupees(total) : e.door && e.price ? rupees(e.price) + ' each' : 'Not listed'}
                </span>
              </div>
              {st === 'failed' ? (
                <div className="col pay-err" role="alert" style={{ gap: '2px' }}>
                  <span className="meta err-txt">That didn't go through. Try again</span>
                  {bk.err ? meta(bk.err) : null}
                </div>
              ) : null}
              {st === 'pending' ? meta("This can take a minute. You won't be charged twice") : null}
              {!online && !moving ? meta('Offline · you can book once you’re connected') : null}
              {S.stopAsk && moving ? (
                /* ✕ while paying: closing only hides the sheet; the bank's answer still arrives */
                <div className="col bk-stop" role="alertdialog" aria-label="Stop paying?" style={{ gap: '8px' }}>
                  <span className="title15">Stop paying?</span>
                  {meta('Your bank may still take it. If it goes through, your pass shows up in Plans')}
                  <Button variant="primary" size="lg" block onClick={() => c.set({ stopAsk: false })}>
                    Keep paying
                  </Button>
                  <Button variant="ghost" block onClick={() => c.set({ sheet: null, stopAsk: false })}>
                    Close
                  </Button>
                </div>
              ) : st === 'blocked' ? (
                /* the door says no for this group: Pay can't be tapped, the reason is on it, and another night is offered */
                <div className="col" style={{ gap: '12px' }}>
                  <Button variant="primary" size="lg" block icon="lock" disabled>
                    {verdict.reasons[0] || 'Not for your group'}
                  </Button>
                  {tryNight ? (
                    <button
                      type="button"
                      className="ev3-try"
                      onClick={() => {
                        c.bkSend('CLOSE');
                        c.openEvent(tryNight.id);
                      }}
                    >
                      <span>
                        Try <b>{tryNight.title}</b>
                      </span>
                      {icon('chevron-right', 20)}
                    </button>
                  ) : null}
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  block
                  icon="ticket"
                  busy={moving || freeing}
                  disabled={st === 'success' || !!partyErr || n < 1 || (!online && !moving)}
                  onClick={payTap}
                >
                  {st === 'paying'
                    ? 'Paying'
                    : st === 'pending'
                      ? 'Checking with your bank'
                      : freeing
                        ? 'Saving your spot'
                        : st === 'failed'
                          ? 'Try again · ' + payLabel
                          : payLabel}
                </Button>
              )}
            </>
          )}
          <p className="note" style={{ textAlign: 'center' }}>
            {guestMode
              ? 'Guest-list passes are free and named · the venue’s door rules still apply'
              : (e.rsvp || !each
                  ? 'Your spot is saved on gathr · '
                  : (Pay.live ? 'Secure payment by Razorpay · ' : 'Test payment · no money is taken · ') + 'no extra fees · ') +
                'refunds follow the organiser’s policy'}
          </p>
        </div>
      )}
    </Sheet>
  );
}
