'use client';

import { useEffect, useRef } from 'react';
import { Wave } from './Phone';

// The phone on the counter in the boot-fitting photo, brought to life (Olly 10-18): the photo is
// laid out like a cover background, and a live screen is fitted onto the phone's glass.
// Glass corners in the photo's own pixels (896 x 900): top-left, top-right, bottom-right, bottom-left.
const PHOTO_W = 896;
// Each is where two glass edges meet: lines fitted along the inside of the case rim, then pulled in
// about 1px so a sliver of the rim shows all round (Olly 10-18: the screen sat just over it).
const GLASS = [[830.0, 354.4], [870.1, 366.2], [811.4, 467.4], [775.8, 448.9]];
const SCREEN_W = 190;
const SCREEN_H = 440;

// A CSS matrix3d that maps a w x h box onto the four corners (square-to-quad homography).
function fitToCorners(w, h, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const k = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].join(',')})`;
}

export default function BenchPhone({ phone }) {
  const frame = useRef(null);
  const screen = useRef(null);

  useEffect(() => {
    const fit = () => {
      const scale = frame.current.offsetWidth / PHOTO_W;
      screen.current.style.transform = fitToCorners(SCREEN_W, SCREEN_H, GLASS.map(([x, y]) => [x * scale, y * scale]));
    };
    const resize = new ResizeObserver(fit);
    resize.observe(frame.current);
    fit();
    return () => resize.disconnect();
  }, []);

  return (
    <div className="bench-photo" aria-hidden="true">
      <div className="bench-frame" ref={frame}>
        <img src="/site/boot-fitting-counter.jpg" alt="" />
        <div className="bench-screen" ref={screen} style={{ width: SCREEN_W, height: SCREEN_H }}>
          <div className="name">ALPINE WAVE</div>
          <div className="sub">LIVE ASSISTANT</div>
          {phone && <div className="num">{phone}</div>}
          <Wave />
          <div className="answered"><i><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" /></svg></i>Answered</div>
        </div>
      </div>
    </div>
  );
}
