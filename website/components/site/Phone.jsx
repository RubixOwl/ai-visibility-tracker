'use client';

import { useEffect, useState } from 'react';

// ?still (or #still) shows every line at once, for screenshots. Reduced motion does the same.
export function isStill() {
  return location.search.includes('still') || location.hash === '#still' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Moving coral lines, shaped like page 1's: tall in the middle, short at the ends.
const BARS = Array.from({ length: 39 }, (_, i) => {
  const x = (i - 19) / 19;
  const envelope = Math.exp(-x * x * 1.6);
  const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 2.7));
  return {
    height: `max(6px, ${Math.round(envelope * jitter * 1000) / 10}%)`,
    animationDelay: `${(i * 0.06).toFixed(2)}s`,
    animationDuration: `${(0.9 + (i % 4) * 0.12).toFixed(2)}s`,
  };
});

export function Wave() {
  return <div className="aw-wave" aria-hidden="true">{BARS.map((style, i) => <i key={i} style={style} />)}</div>;
}

// The dark phone used in sections 2 to 4.
export function Phone({ mini = false, status = true, name = 'Alpine Wave', sub = 'answering for your shop', label = true, children }) {
  return (
    <div className={`aw-phone-wrap${mini ? ' mini' : ''}`}>
      <div className="aw-phone">
        <div className="aw-screen">
          {status && <div className="aw-status"><span>9:41</span><span>●●●</span></div>}
          <div className="aw-island" />
          <div className="aw-who">
            <div className="name">{name}</div>
            <div className="sub">{sub}</div>
          </div>
          <Wave />
          {children}
        </div>
      </div>
      {label && <p className="example-label">Example shop: made-up details</p>}
    </div>
  );
}

// A call that plays out line by line, then starts again. lines: [['caller' | 'aw', text], ...]
export function Talk({ lines }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (isStill()) { setShown(lines.length); return; }
    let timers = [];
    const play = () => {
      timers.forEach(clearTimeout);
      setShown(0);
      timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), 600 + i * 1400));
    };
    play();
    const loop = setInterval(play, 600 + lines.length * 1400 + 4000);
    return () => { clearInterval(loop); timers.forEach(clearTimeout); };
  }, [lines]);
  return (
    <div className="aw-talk">
      {lines.map(([who, text], i) => <div key={i} className={`aw-bubble ${who}${i < shown ? ' on' : ''}`}>{text}</div>)}
    </div>
  );
}
