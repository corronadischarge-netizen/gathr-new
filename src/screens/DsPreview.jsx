import { EVENTS } from '../data/listings';
import { DoorVerdict, GroupPill, IconButton, NightRail, NightTile } from '../design-system';

/* Review only (?review → "Home v3 · components"): every state of the four new home v3 components, on sample data */
const T = '2026-10-10T12:00:00+05:30';
const YES = { state: 'yes', text: 'Lets you in · 18+', icon: 'check' };
const IF = { state: 'if', text: 'Formals only', icon: 'shirt' };
const UNK = { state: 'unknown', text: 'Stag rules not listed', icon: 'info' };
const NO = { state: 'no', text: 'Couples only tonight', icon: 'x' };
const FACES = [{ name: 'Zoya' }, { name: 'Aman' }, { name: 'Kavya' }, { name: 'Kabir' }];

function Sec(p) {
  return (
    <section className="col" style={{ gap: 'var(--space-3)' }}>
      <div className="px rowc between">
        <h2 className="g-section-title" style={{ margin: 0 }}>
          {p.title}
        </h2>
        {p.sample ? <span className="sample">Sample data</span> : null}
      </div>
      {p.children}
    </section>
  );
}

export function DsPreview(p) {
  var c = p.ctx,
    img = (k) => EVENTS[k] && EVENTS[k].img,
    tap = () => c.toast('Opens the night');
  return (
    <div className="col" style={{ padding: '52px 0 140px', gap: 'var(--space-8)' }}>
      <div className="px rowc" style={{ gap: 'var(--space-3)' }}>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <h1 className="g-section-title" style={{ margin: 0 }}>
          Home v3 components
        </h1>
      </div>

      <Sec title="DoorVerdict · pill" sample>
        <div className="px col" style={{ gap: 'var(--space-3)' }}>
          <DoorVerdict look="pill" state="yes" text="Lets 4 guys in · ID needed" source={{ kind: 'gathr', checkedAt: T }} />
          <DoorVerdict look="pill" state="if" icon="shirt" text="Lets 4 guys in · formals only, before 10:30" source={{ kind: 'host' }} />
          <DoorVerdict look="pill" state="unknown" text="Stag rules not listed" onAsk={() => c.toast('Opens WhatsApp or a call to the venue')} />
          <DoorVerdict look="pill" state="no" text="Couples only tonight" source={{ kind: 'guests', count: 12 }} />
          <DoorVerdict look="pill" state="unknown" icon="info" text="Couples only" source={{ kind: 'gathr', checkedAt: T }} />
        </div>
      </Sec>

      <Sec title="DoorVerdict · line" sample>
        <div className="px col" style={{ gap: 'var(--space-2)' }}>
          <DoorVerdict look="line" {...YES} />
          <DoorVerdict look="line" {...IF} />
          <DoorVerdict look="line" state="if" icon="clock" text="Before 10:30" />
          <DoorVerdict look="line" state="if" icon="indian-rupee" text="Stags ₹500" />
          <DoorVerdict look="line" {...UNK} />
          <DoorVerdict look="line" {...NO} />
        </div>
      </Sec>

      <Sec title="NightTile · tile" sample>
        <NightRail title="Tonight · 9 more" seeAllLabel="See all" onSeeAll={() => c.toast('Opens All nights')} total={12}>
          <NightTile key="a" image={img('dandiyaunited')} name="Dandiya United (East Pune)" venue="The Mills" time="6 pm" price="₹100" crowd="buzzing" verdict={YES} onClick={tap} />
          <NightTile key="b" image={img('twin')} name="Twin Strings: Karwaan Tour" venue="Epitome" time="9:30 pm" price="₹1,299" crowd="warming" verdict={IF} badge="Promoted" onClick={tap} />
          <NightTile key="c" image={img('jamming')} name="Jamming Night" venue="Kurry Leaf" time="8 pm" price="₹299" crowd="packed" verdict={UNK} badge="Live" onClick={tap} />
          <NightTile key="d" name="A night with no organiser image" venue="Plunge" time="9 pm" crowd="quiet" verdict={YES} onClick={tap} />
          <NightTile key="e" image={img('punedandiya')} name="Pune’s Biggest Dandiya Nights" venue="Mahalaxmi Lawns" time="7 pm" price="₹1,000" crowd="full" verdict={YES} onClick={tap} />
          <NightTile key="f" image={img('royalraas')} name="Royal Raas 2.0" venue="Kurry Leaf" time="6 pm" price="Free" crowd="warming" verdict={NO} onClick={tap} />
          <NightTile key="g" loading />
        </NightRail>
        <p className="meta px" style={{ margin: 0 }}>
          In order: yes · if + Promoted · unknown + Live · no image, no price · sold out · no (for All nights only) · loading · See all end tile
        </p>
      </Sec>

      <Sec title="NightTile · row" sample>
        <div className="px col">
          <NightTile layout="row" image={img('dandiyaunited')} name="Dandiya United (East Pune)" venue="The Mills" distance="15 min" time="6 pm" price="₹100" crowd="buzzing" verdict={YES} onClick={tap} />
          <NightTile layout="row" image={img('twin')} name="Twin Strings: Karwaan Tour" venue="Epitome" distance="25 min" time="9:30 pm" price="₹1,299" crowd="warming" verdict={IF} onClick={tap} />
          <NightTile layout="row" name="A night with no organiser image" venue="Plunge" distance="10 min" time="9 pm" crowd="quiet" verdict={UNK} onClick={tap} />
          <NightTile layout="row" image={img('royalraas')} name="Royal Raas 2.0" venue="Kurry Leaf" distance="35 min" time="6 pm" price="Free" crowd="full" verdict={NO} onClick={tap} />
          <NightTile layout="row" loading />
        </div>
      </Sec>

      <Sec title="GroupPill" sample>
        <div className="px col" style={{ gap: 'var(--space-3)' }}>
          <GroupPill state="plan-vote" people={FACES} title="Friday plan · 4 guys, all 21+" line="3 of 4 voted · closes 8 pm" onOpen={() => c.toast('Opens the plan')} />
          <GroupPill state="plan-booked" people={FACES} title="Friday · Bollywood Night" line="You're in · Show pass" onOpen={() => c.toast('Opens the pass')} />
          <GroupPill state="group-set" people={[{ name: c.S.me.name || 'You' }]} title="Going as 4 guys, all 21+" onOpen={() => c.toast('Opens Going as')} />
          <GroupPill state="group-unset" title="Who's going?" line="Add your group to check the door" onOpen={() => c.toast('Opens Going as')} />
        </div>
      </Sec>
    </div>
  );
}
