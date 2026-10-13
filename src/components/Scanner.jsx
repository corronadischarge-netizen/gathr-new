import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { ScanResult } from './ScanResult';
import { hostCur } from '../data/hostNights';
import { EVENTS } from '../data/listings';
import { Button, IconButton } from '../design-system';
import { useDialog } from '../hooks/useDialog';
import { checkPass } from '../lib/passQr';
import { meta } from '../ui/helpers';
import { DoorListLine } from './DoorListLine';

const HOLD = 2000;

/* full-screen camera: BarcodeDetector where the phone has it, jsQR everywhere else */
export function Scanner(p) {
  var c = p.ctx,
    S = c.S,
    id = hostCur(S);
  var vid = useRef(null),
    rs = useState(null),
    res = rs[0],
    setRes = rs[1],
    es = useState(null),
    err = es[0],
    setErr = es[1];
  /* a result stays until the next pass is scanned or the camera view is tapped, never less than 2 s (spec 6.14).
     One waiting on "Let them in" stays until door staff answer it, so nobody is skipped by accident */
  var busy = useRef(false),
    resRef = useRef(null),
    last = useRef({ txt: null, at: 0 });
  resRef.current = res;
  function holding() {
    var r = resRef.current;
    return !!r && (r.admit || Date.now() - last.current.at < HOLD);
  }
  function clear() {
    setRes(null);
    last.current.at = Date.now(); // the pass still in front of the camera isn't read again straight away
  }
  var sRef = useRef(S);
  sRef.current = S;
  useEffect(() => {
    var stream = null,
      stop = false,
      timer = null,
      det = null,
      cv = document.createElement('canvas'),
      cx2 = cv.getContext('2d', { willReadFrequently: true });
    if ('BarcodeDetector' in window) {
      try {
        det = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {
        det = null;
      }
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErr('This browser can’t open the camera. Type the code on the Door screen instead');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(
        (s2) => {
          if (stop) {
            s2.getTracks().forEach((t) => {
              t.stop();
            });
            return;
          }
          stream = s2;
          var v = vid.current;
          v.srcObject = s2;
          v.setAttribute('playsinline', '');
          v.muted = true;
          v.play().catch(() => {});
          function tick() {
            if (stop) return;
            timer = setTimeout(tick, 180);
            if (holding() || busy.current || !v.videoWidth) return;
            busy.current = true;
            var found = (txt) => {
              busy.current = false;
              if (!txt) return;
              // the same pass, still in frame, isn't read twice in a row within the hold
              if (txt === last.current.txt && Date.now() - last.current.at < HOLD) return;
              last.current = { txt: txt, at: Date.now() };
              setRes(checkPass(sRef.current, id, txt));
            };
            if (det) {
              det.detect(v).then(
                (codes) => {
                  found(codes && codes[0] && codes[0].rawValue);
                },
                () => {
                  busy.current = false;
                }
              );
              return;
            }
            var w = Math.min(640, v.videoWidth),
              hh = Math.round((v.videoHeight * w) / v.videoWidth);
            cv.width = w;
            cv.height = hh;
            cx2.drawImage(v, 0, 0, w, hh);
            var img = cx2.getImageData(0, 0, w, hh),
              q = jsQR(img.data, w, hh, { inversionAttempts: 'attemptBoth' });
            found(q && q.data);
          }
          tick();
        },
        (e) => {
          setErr(
            e && e.name === 'NotAllowedError'
              ? 'Camera access is blocked. Allow the camera for this site in your browser settings, or type the code on the Door screen'
              : 'The camera couldn’t start. Type the code on the Door screen instead'
          );
        }
      );
    return () => {
      stop = true;
      clearTimeout(timer);
      if (stream)
        stream.getTracks().forEach((t) => {
          t.stop();
        });
    };
  }, []);
  var ref = useRef(null);
  useDialog(ref, true, () => {
    c.set({ scanning: false });
  });
  var e = EVENTS[id];
  return (
    <div className="scanner" ref={ref} role="dialog" aria-modal="true" aria-label="Scan a pass">
      <video ref={vid} className="scan-video" playsInline muted aria-hidden />
      {/* the result fills the screen in its colour, so it reads from across the door */}
      <div className={'scan-wash' + (res ? ' tone-' + res.tone : '')} aria-hidden />
      {res && !res.admit ? (
        // a tap anywhere on the camera view: next guest
        <button type="button" className="scan-tap" aria-label="Next guest" onClick={clear} />
      ) : null}
      <div className="scan-frame" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="scan-top rowc between">
        <div className="col" style={{ gap: '2px' }}>
          <span className="title15">Scan a pass</span>
          {meta(e ? e.title + ' · ' + e.date : '')}
          <DoorListLine ctx={c} id={id} />
        </div>
        <IconButton
          icon="x"
          label="Close scanner"
          variant="scrim"
          onClick={() => c.set({ scanning: false })}
        />
      </div>
      <div className="scan-bottom">
        {err ? (
          <div className="scan-res tone-amber" role="alert">
            <span className="scan-res-l">{err}</span>
            <Button variant="subtle" block onClick={() => c.set({ scanning: false })}>
              Type the code instead
            </Button>
          </div>
        ) : res ? (
          <ScanResult ctx={c} id={id} res={res} onDone={clear} />
        ) : (
          <p className="scan-hint" aria-live="polite">
            Hold the pass inside the frame. It scans on its own
          </p>
        )}
      </div>
    </div>
  );
}
