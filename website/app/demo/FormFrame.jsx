'use client';

import { useEffect, useRef, useState } from 'react';

/* The Google Form frame (T105). Google never tells our page the form was sent, but the frame reloads:
   load 1 = the form, load 2 = "Your response has been recorded", load 3 = "Submit another response"
   brings the form back. So an even load count means sent: the frame shrinks to the short thank-you
   height and scrolls back into view, instead of leaving a tall empty coral box.
   The frame is added after the page starts, so no load can happen before we are watching. */
export default function FormFrame({ src }) {
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const loads = useRef(0);
  const box = useRef(null);

  useEffect(() => setReady(true), []);

  const onLoad = () => {
    loads.current += 1;
    const nowSent = loads.current % 2 === 0;
    setSent(nowSent);
    if (loads.current > 1) box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`form-card${sent ? ' sent' : ''}`} ref={box}>
      {ready ? (
        <iframe src={src} title="Free demo request form" loading="lazy" onLoad={onLoad}>Loading…</iframe>
      ) : (
        <div className="frame-wait" />
      )}
    </div>
  );
}
