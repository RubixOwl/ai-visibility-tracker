'use client';

import { useEffect, useRef, useState } from 'react';
import CABLE_PATH from './cable/cable-path.json';
import S from './cable/rider-sprites.json';
import './hero-cable.css';

/* Cable phones on page 1 (T123). Ported from the approved side build, Model Ideas/Claude Ideas/EA Side Project/
   hero-cable.js (notes: README-cable-loop.md there).
   Seven riders share one path, spaced exactly 1/7 of a loop apart. The drawn cable and the riders both read
   cable/cable-path.json (source px of the 1376x768 still), so a phone can never leave the cable.
   Each rider is cut from the still itself (cable/rider-sprites.json): the real phone, grip and hanger, its glow
   as an added-light layer, and its waveform. Only the message text is live.
   Messages are handed out in turn, so the front phone always shows 1, 2, 3, 4, 5, 1, 2...
   Still photo instead (nothing rendered here, no loop): reduced motion, windows 760px wide or less, or the
   plate fails to load. The still is page 1's own CSS background.
   Test hook: /?freeze=<ms> draws one frame at that time and stops. */
const SRC_W = 1376, SRC_H = 768;
const RIDERS = 7;
const GAP_MS = 11000;                  // one phone every 11 s (Olly #11, #12: 4.5 s then 8 s were too quick; 7 riders keep the spacing)
const LOOP_MS = RIDERS * GAP_MS;
const ASSETS = '/site/cable/';

const MESSAGES = [
  "We answer your phone, so you don’t have to.",
  "Stay with the customer in front of you. We’ll answer the ones on the phone.",
  "Alpine Wave gives you more time to do what you enjoy.",
  "No more repeat questions. Alpine Wave has you covered.",
  "No new phone system. Only says what you’ve approved.",
];

// Phase -> grip x and phone height (source px). The 7 riders sit at phases (j + 0.5) / 7, which are
// exactly the 7 phones in the still, so the opening frame is the picture Olly already likes.
// 0 = inside the cloud at the far end, 1 = off past the top-left.
const KEYS = [
  [0.0, 1212, 10],
  [0.5 / 7, 1192, 15],
  [1.5 / 7, 1172, 22],
  [2.5 / 7, 1139, 32],
  [3.5 / 7, 1071, 48],
  [4.5 / 7, 964, 88],
  [5.5 / 7, 774, 160],
  [6.5 / 7, 352, 339],
  [1.0, -560, 640],
];
// Glow strength by phase: faint far away, full at the front, easing off just before the wrap
const GLOW = [[0, 0], [0.5 / 7, 0.2], [2.5 / 7, 0.4], [4.5 / 7, 0.7], [6.5 / 7, 1], [0.97, 0.8], [1, 0]];
const FADE_IN = 0.065;                 // ~2 s to come out of the cloud (Olly #9: it appeared too quickly)
const PHONE_H = S.body.h;              // sprite is the still's front phone: scale 1 = 339px tall

/* ---------- cable line ---------- */
// The first traced points at the top edge are wrong (the trace lost the cable there), so drop them
// and extend the line up-left along the slope of the good part.
const pts = CABLE_PATH.cable.filter(([x]) => x >= 192);
const slope = (pts[6][1] - pts[0][1]) / (pts[6][0] - pts[0][0]);
function cableY(x) {
  if (x <= pts[0][0]) return pts[0][1] + (x - pts[0][0]) * slope;
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts.at(-1)[1];
}

/* ---------- smooth interpolation (monotone cubic, so speed never jumps or overshoots) ---------- */
function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x) => {
    let i = 0; while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}
const phases = KEYS.map((k) => k[0]);
const xAt = monotone(phases, KEYS.map((k) => k[1]));
const logHAt = monotone(phases, KEYS.map((k) => Math.log(k[2])));   // perspective is roughly exponential
const glowAt = monotone(GLOW.map((g) => g[0]), GLOW.map((g) => g[1]));

// the cable: short segments, thick at the front, thin and fading into the cloud at the far end
const xEnd = pts.at(-1)[0];
let CABLE_SEGS = '';
for (let x = -640; x < xEnd; x += 8) {
  const x2 = Math.min(x + 8, xEnd);
  const w = Math.max(1.4, 6.6 - 5 * ((x - 192) / (xEnd - 192)));
  const fade = Math.min(1, (xEnd - x) / 40);
  const y1 = cableY(x), y2 = cableY(x2);
  CABLE_SEGS += `<line x1="${x}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#40454b" stroke-width="${w.toFixed(2)}" stroke-linecap="round" opacity="${fade.toFixed(2)}"/>`;
  CABLE_SEGS += `<line x1="${x}" y1="${y1 - w * 0.22}" x2="${x2}" y2="${y2 - w * 0.22}" stroke="#fff" stroke-opacity="${(0.28 * fade).toFixed(2)}" stroke-width="${(w * 0.25).toFixed(2)}" stroke-linecap="round"/>`;
}

/* Builds the stage inside `stage` (the .cable-stage div) and runs the loop. Returns a cleanup function. */
function runCable(stage, inner, { onReady, onFail }) {
  const hero = stage.parentElement;
  let dead = false;
  const cleanups = [];

  const plate = new Image();
  plate.className = 'clean-plate';
  plate.alt = '';
  plate.src = ASSETS + 'clean-plate.webp';
  plate.onerror = () => { if (dead) return; if (!plate.src.endsWith('.jpg')) plate.src = ASSETS + 'clean-plate.jpg'; else { dead = true; onFail(); } };
  inner.append(plate);

  const svgNS = 'http://www.w3.org/2000/svg';
  const cable = document.createElementNS(svgNS, 'svg');
  cable.setAttribute('class', 'cable-line');
  cable.setAttribute('viewBox', `0 0 ${SRC_W} ${SRC_H}`);
  cable.innerHTML = CABLE_SEGS;
  inner.append(cable);

  // the cloud the phones come out of (Olly #9: raised and a little thicker than the fog that was there)
  const cloud = document.createElement('div');
  cloud.className = 'spawn-cloud';
  cloud.innerHTML = '<i></i>'.repeat(6);
  cloud.style.left = xEnd + 4 + 'px';
  cloud.style.top = cableY(xEnd) + 4 + 'px';

  const box = (el, r) => Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });

  // glows are their own layer (added light, so they brighten the snow like the still) under all the phones
  const riders = Array.from({ length: RIDERS }, (_, j) => {
    const glow = document.createElement('div');
    glow.className = 'rider-glow';
    const gi = new Image(); gi.src = ASSETS + 'rider-glow.png'; gi.alt = '';
    box(gi, S.box);
    glow.append(gi);
    inner.append(glow);
    return { glow, j, msgIndex: -1 };
  });
  riders.forEach((r) => {
    const el = document.createElement('div');
    el.className = 'rider';
    const phone = new Image(); phone.src = ASSETS + 'rider-phone.webp'; phone.alt = ''; phone.className = 'rider-img';
    box(phone, S.box);
    const text = document.createElement('p'); text.className = 'rider-text';
    box(text, S.text);
    const wave = new Image(); wave.src = ASSETS + 'rider-wave.png'; wave.alt = ''; wave.className = 'rider-wave';
    box(wave, S.wave);
    wave.style.animationDelay = -(r.j * 0.37).toFixed(2) + 's';
    el.append(phone, text, wave);
    inner.append(el);
    Object.assign(r, { el, text, seed: r.j * 1.3 });
  });
  inner.append(cloud);

  // One font size per message, so each fits the still's text area (message 2 is the longest)
  const sizes = [];
  function fitText() {
    const probe = riders[0].text;
    MESSAGES.forEach((m, i) => {
      let size = 22;
      probe.textContent = m;
      probe.style.fontSize = size + 'px';
      while (probe.scrollHeight > S.text.h && size > 12) probe.style.fontSize = (size -= 0.5) + 'px';
      sizes[i] = size;
    });
    riders.forEach((r) => { r.msgIndex = -1; });
  }

  /* ---------- cover: the same crop as the CSS background (center / cover) ---------- */
  function fit() {
    const W = hero.clientWidth, H = hero.clientHeight;
    const s = Math.max(W / SRC_W, H / SRC_H);
    inner.style.transform = `translate(${(W - SRC_W * s) / 2}px, ${(H - SRC_H * s) / 2}px) scale(${s})`;
  }

  /* ---------- place one rider ---------- */
  // Rider j sits at (j + 0.5) / 7 at t = 0. Its place in the line-up is 6 - j, and each lap moves it
  // 7 places on, so its message is (6 - j + 7 * laps) mod 5: the front always runs 1, 2, 3, 4, 5, 1...
  function place(r, t, now) {
    const run = (r.j + 0.5) / RIDERS + t / LOOP_MS;
    const laps = Math.floor(run), phase = run - laps;
    const mi = (((RIDERS - 1 - r.j + RIDERS * laps) % MESSAGES.length) + MESSAGES.length) % MESSAGES.length;
    if (mi !== r.msgIndex) { r.msgIndex = mi; r.text.textContent = MESSAGES[mi]; r.text.style.fontSize = sizes[mi] + 'px'; }

    const x = xAt(phase), y = cableY(x);
    const k = Math.exp(logHAt(phase)) / PHONE_H;
    const sway = Math.sin((now / 4200) * 2 * Math.PI + r.seed) * 0.8;
    const fadeIn = Math.min(1, phase / FADE_IN);
    const haze = 0.82 + 0.18 * Math.min(1, phase / 0.5);
    const tf = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${k.toFixed(4)}) rotate(${sway.toFixed(3)}deg)`;
    r.el.style.transform = tf;
    r.el.style.opacity = (fadeIn * fadeIn * haze).toFixed(3);
    r.el.style.zIndex = String(Math.round(phase * 100) + 1);
    r.glow.style.transform = tf;
    r.glow.style.opacity = (glowAt(phase) * fadeIn).toFixed(3);
  }

  let t = 0, last = null, raf = 0;
  const draw = (now) => riders.forEach((r) => place(r, t, now));
  function frame(now) {
    if (last !== null) t = (t + Math.min(50, now - last)) % (LOOP_MS * MESSAGES.length);   // capped step: no jump after a pause
    last = now;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) { last = null; raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  cleanups.push(stop);

  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(hero);
  cleanups.push(() => ro.disconnect());

  const freeze = new URLSearchParams(location.search).get('freeze');
  const imgs = [...inner.querySelectorAll('img')];
  const ready = Promise.all([...imgs.map((i) => i.decode().catch(() => {})), document.fonts ? document.fonts.ready : null]);
  ready.then(() => {
    if (dead) return;   // plate failed or unmounted: the still stays
    fitText();
    draw(0);
    onReady();
    if (freeze !== null) { stage.style.transition = 'none'; t = Number(freeze); draw(0); return; }
    let onScreen = true;
    const update = () => (onScreen && !document.hidden ? start() : stop());
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); });
    io.observe(hero);
    document.addEventListener('visibilitychange', update);
    cleanups.push(() => { io.disconnect(); document.removeEventListener('visibilitychange', update); });
    update();
  });

  return () => { dead = true; cleanups.forEach((f) => f()); inner.replaceChildren(); };
}

export default function HeroCable() {
  const [allowed, setAllowed] = useState(false);   // wider than 760px and motion allowed (false during server render)
  const [failed, setFailed] = useState(false);
  const [on, setOn] = useState(false);
  const stageRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 760px)');
    const update = () => setAllowed(!reduce.matches && !narrow.matches);
    update();
    reduce.addEventListener('change', update);
    narrow.addEventListener('change', update);
    return () => { reduce.removeEventListener('change', update); narrow.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    if (!allowed || failed) return undefined;
    const stop = runCable(stageRef.current, innerRef.current, { onReady: () => setOn(true), onFail: () => setFailed(true) });
    return () => { stop(); setOn(false); };
  }, [allowed, failed]);

  if (!allowed || failed) return null;
  return (
    <div className={`cable-stage${on ? ' cable-on' : ''}`} aria-hidden="true" ref={stageRef}>
      <div className="cable-inner" ref={innerRef} />
    </div>
  );
}
