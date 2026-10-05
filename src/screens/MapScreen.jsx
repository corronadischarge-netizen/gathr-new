import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { IMAGES_3D } from '../assets/images';
import { priceTxt } from '../data/format';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { Button, CrowdMeter, SearchField, Sheet } from '../design-system';
import { useSheetExit } from '../hooks/useSheetExit';
import { ms } from '../lib/motion';
import { Share } from '../services/share';
import { i3, icon, meta, note, sampleTag, svgIcon, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

function pinHtml(x, sel, count) {
  var cr = x.crowd
    ? '<span class="vpin-crowd"><i style="background:var(--crowd-' +
      x.crowd +
      ')"></i>' +
      x.crowd.charAt(0).toUpperCase() +
      x.crowd.slice(1) +
      '</span>'
    : '<span class="vpin-crowd">' + count + ' venues · zoom in</span>';
  return (
    '<div class="vpin hue-' +
    x.hue +
    (sel ? ' is-sel' : '') +
    (count ? ' is-cluster' : '') +
    '"><div class="vpin-bub"><img src="' +
    IMAGES_3D[x.ic] +
    '" alt="">' +
    (count ? '<b class="vpin-n">' + count + '</b>' : '') +
    '</div><div class="vpin-lbl"><b>' +
    x.name +
    '</b>' +
    cr +
    '</div></div>'
  );
}

export function MapScreen(p) {
  var c = p.ctx,
    S = c.S,
    v = S.mapSel ? VENUES[S.mapSel] : null;
  var evs = v
    ? upcoming()
        .filter((k) => EVENTS[k].venue === v.id)
        .map((k) => EVENTS[k])
    : [];
  var e = evs[0];
  var el = useRef(null),
    mr = useRef(null),
    setRef = useRef(c.set);
  setRef.current = c.set;
  const [failed, setFailed] = useState(false);
  // the venue card slides away when closed, like the other sheets
  var slot = useRef(null),
    slotExit = useRef(null);
  useSheetExit(S.mapSel, slot, slotExit);
  /* open-source map: MapLibre GL + OpenFreeMap vector tiles (OpenStreetMap data). No API key. */
  useEffect(() => {
    var ML = maplibregl;
    if (!ML || !el.current) {
      setFailed(true);
      return;
    }
    var m;
    try {
      m = new ML.Map({
        container: el.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: [73.88, 18.539],
        zoom: 12,
        minZoom: 9,
        maxZoom: 18,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: false
      });
    } catch (err) {
      setFailed(true);
      return;
    }
    m.touchZoomRotate.disableRotation();
    var styled = false,
      fellBack = false;
    m.on('style.load', () => {
      styled = true;
    });
    /* if the vector style can't load, fall back to plain OpenStreetMap raster tiles, darkened */
    function fallback() {
      if (styled || fellBack) return;
      fellBack = true;
      m.setStyle({
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#0e0e10' } },
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: { 'raster-saturation': -0.85, 'raster-brightness-max': 0.42, 'raster-contrast': 0.15 }
          }
        ]
      });
    }
    m.on('error', () => {
      fallback();
    });
    var fbTimer = setTimeout(fallback, 8000);
    var keys = Object.keys(VENUES),
      mk = {},
      clusters = [];
    function pinEl(html, onTap, label) {
      var d = document.createElement('div');
      d.className = 'vpin-wrap';
      d.innerHTML = html;
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', label);
      d.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onTap();
      });
      d.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          onTap();
        }
      });
      return d;
    }
    keys.forEach((k) => {
      var x = VENUES[k];
      mk[k] = new ML.Marker({
        element: pinEl(
          pinHtml(x, false),
          () => {
            setRef.current({ mapSel: k });
          },
          x.name + ', ' + x.crowd
        ),
        anchor: 'bottom'
      }).setLngLat([x.lng, x.lat]);
      mk[k]._on = false;
    });
    /* pins closer than 58px merge into one group pin; tapping it zooms in until they separate */
    function sync() {
      var groups = [];
      if (el.current) el.current.classList.toggle('z-far', m.getZoom() < 13);
      keys.forEach((k) => {
        var pt = m.project([VENUES[k].lng, VENUES[k].lat]),
          g = null;
        for (var i = 0; i < groups.length; i++)
          if (Math.hypot(groups[i].pt.x - pt.x, groups[i].pt.y - pt.y) < 58) {
            g = groups[i];
            break;
          }
        if (g) g.ks.push(k);
        else groups.push({ pt: pt, ks: [k] });
      });
      clusters.forEach((x) => {
        x.remove();
      });
      clusters = [];
      groups.forEach((g) => {
        if (g.ks.length === 1) {
          var one = mk[g.ks[0]];
          if (!one._on) {
            one.addTo(m);
            one._on = true;
          }
          return;
        }
        g.ks.forEach((k) => {
          if (mk[k]._on) {
            mk[k].remove();
            mk[k]._on = false;
          }
        });
        var first = VENUES[g.ks[0]],
          areas = g.ks.map((k) => VENUES[k].area.split(',')[0]);
        var same = areas.every((a) => a === areas[0]);
        var lat = 0,
          lng = 0;
        g.ks.forEach((k) => {
          lat += VENUES[k].lat;
          lng += VENUES[k].lng;
        });
        var b = new ML.LngLatBounds();
        g.ks.forEach((k) => {
          b.extend([VENUES[k].lng, VENUES[k].lat]);
        });
        var cm = new ML.Marker({
          element: pinEl(
            pinHtml(
              { name: same ? areas[0] : g.ks.length + ' venues', hue: first.hue, ic: first.ic },
              false,
              g.ks.length
            ),
            () => {
              m.fitBounds(b, { padding: 120, maxZoom: 16, duration: ms('--motion-slower') });
            },
            (same ? areas[0] + ', ' : '') + g.ks.length + ' venues. Zoom in'
          ),
          anchor: 'bottom'
        })
          .setLngLat([lng / g.ks.length, lat / g.ks.length])
          .addTo(m);
        cm.getElement().style.zIndex = 5;
        clusters.push(cm);
      });
    }
    m.on('zoomend', sync);
    m.on('load', sync);
    m.on('click', () => {
      setRef.current({ mapSel: null });
    });
    sync();
    mr.current = { m: m, mk: mk };
    var t = setTimeout(() => {
      m.resize();
      sync();
    }, 320);
    return () => {
      clearTimeout(t);
      clearTimeout(fbTimer);
      m.remove();
      mr.current = null;
    };
  }, []);
  useEffect(() => {
    var r = mr.current;
    if (!r) return;
    // switch the pin's state in place (not redraw it), so it grows and turns violet while the last one shrinks back
    Object.keys(r.mk).forEach((k) => {
      var el2 = r.mk[k].getElement(),
        pin = el2.querySelector('.vpin');
      if (pin) pin.classList.toggle('is-sel', S.mapSel === k);
      el2.style.zIndex = S.mapSel === k ? 10 : 1;
    });
    if (S.mapSel) {
      var x = VENUES[S.mapSel];
      r.m.flyTo({
        center: [x.lng, x.lat],
        zoom: Math.max(r.m.getZoom(), 15),
        offset: [0, -170],
        duration: ms('--motion-slower')
      });
    }
  }, [S.mapSel]);
  function zoom(d) {
    var r = mr.current;
    if (!r) return;
    if (d) r.m.easeTo({ zoom: r.m.getZoom() + d, duration: 250 });
    else {
      var b = new maplibregl.LngLatBounds();
      Object.keys(VENUES).forEach((k) => {
        b.extend([VENUES[k].lng, VENUES[k].lat]);
      });
      r.m.fitBounds(b, {
        padding: { top: 130, bottom: 150, left: 40, right: 70 },
        duration: ms('--motion-slower')
      });
    }
  }
  function locate() {
    var r = mr.current;
    if (!r || !navigator.geolocation) {
      c.toast('Location isn’t available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        r.m.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: ms('--motion-slower')
        });
        c.toast('Showing where you are');
      },
      () => {
        c.toast('Location permission was declined');
      },
      { timeout: 8000 }
    );
  }
  return (
    <div className="full" style={{ background: 'var(--night-900)' }}>
      <div ref={el} className="real-map" aria-label="Map of Pune venues" />
      {failed ? (
        <div className="map-fail">
          {i3('discoball', 72)}
          <span className="title15">The map couldn’t load</span>
          {meta('Check your connection. Venues are still in This week and Search.')}
        </div>
      ) : null}
      <div
        className="rowc"
        style={{ position: 'absolute', left: '16px', right: '16px', top: '52px', gap: '8px', zIndex: 5 }}
      >
        <div style={{ flexGrow: 1 }}>
          <SearchField
            placeholder="Search venues, nights, artists"
            aria-label="Search"
            onFocus={() => c.tab('search')}
          />
        </div>
      </div>
      <div className="map-chip" style={{ zIndex: 5 }}>
        Crowd is sample data · pins are approximate
      </div>
      {!v ? (
        <div className="map-ctrls">
          <button type="button" aria-label="Zoom in" onClick={() => zoom(1)}>
            {svgIcon(['M12 5v14', 'M5 12h14'], 20)}
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => zoom(-1)}>
            {svgIcon(['M5 12h14'], 20)}
          </button>
          <button type="button" aria-label="Show my location" onClick={locate}>
            {icon('navigation', 18)}
          </button>
          <button type="button" aria-label="Show all venues" onClick={() => zoom(0)}>
            {icon('map', 18)}
          </button>
        </div>
      ) : null}
      {v ? (
        <div ref={slot} className="sheet-slot rise" style={{ zIndex: 20 }}>
          <Sheet
            title={v.name}
            subtitle={v.area + ' · ' + evs.length + (evs.length === 1 ? ' night' : ' nights') + ' listed'}
            onClose={() => c.set({ mapSel: null })}
          >
            <div className="rowc" style={{ gap: '8px' }}>
              <CrowdMeter level={v.crowd} />
              {sampleTag()}
            </div>
            {note('Crowd is sample data.')}
            {!evs.length ? meta('No nights listed here right now. See what’s on elsewhere this week.') : null}
            {evs.map((x) => (
              <Tap
                onClick={() => c.openEvent(x.id)}
                key={x.id}
                className="tap rowc"
                style={{ gap: '12px' }}
                aria-label={x.title}
              >
                {thumb(x, 48)}
                <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                  <span className="title15">{x.title}</span>
                  {meta(x.date + ' · ' + x.time + ' · ' + priceTxt(x))}
                </div>
                {icon('chevron-right')}
              </Tap>
            ))}
            {/* two equal buttons that always fit on one line */}
            <div className="btn-pair">
              <Button variant="subtle" icon="navigation" block onClick={() => Share.directions(v)}>
                Directions
              </Button>
              {e ? (
                <Button variant="primary" icon="ticket" block onClick={() => c.openEvent(e.id, 'list')}>
                  {e.rsvp ? 'RSVP' : e.src === 'district' ? 'Get tickets' : 'Get on the list'}
                </Button>
              ) : (
                <Button variant="primary" icon="arrow-right" block onClick={() => c.tab('tonight')}>
                  What’s on
                </Button>
              )}
            </div>
          </Sheet>
        </div>
      ) : null}
      <div ref={slotExit} className="sheet-exit" aria-hidden="true" />
    </div>
  );
}
