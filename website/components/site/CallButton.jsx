'use client';

import { useEffect, useRef, useState } from 'react';

/* A call button (T124). On phones and tablets it stays a plain tel: link and dials. On a computer, where tel:
   only opens a "pick an app" box, the click shows the number with a Copy button instead (Olly 10-22).
   phone / href = PHONE / PHONE_URL from Site.jsx.
   place = where the panel opens: "below" (header pill) or "above" (section 2, clear of the sticky demo bar). */
export default function CallButton({ className, phone: PHONE, href: PHONE_URL, place = 'below', children }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef(null);

  // Close on Esc or a click outside, while open
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    const onClick = e => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [open]);

  const onCall = e => {
    // Read at click time: a computer has a mouse that hovers. Touch screens fall through and dial.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    e.preventDefault();
    setOpen(o => !o);
    setCopied(false);
  };

  // Same as CopyEmail.jsx
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PHONE);
    } catch {
      // Older browsers, or clipboard blocked: copy through a hidden text box
      const box = document.createElement('textarea');
      box.value = PHONE;
      document.body.appendChild(box);
      box.select();
      document.execCommand('copy');
      box.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={`call-wrap call-wrap-${place}`} ref={wrap}>
      <a className={className} href={PHONE_URL} onClick={onCall} aria-expanded={open}>{children}</a>
      {open && (
        <span className="call-panel" role="dialog" aria-label="Our phone number">
          <span className="call-panel-text">Call <b>{PHONE}</b> from your phone to hear it answer.</span>
          <button type="button" className="call-copy" onClick={copy} aria-label={`Copy ${PHONE}`}>
            {copied ? 'Copied ✓' : 'Copy number'}
          </button>
        </span>
      )}
    </span>
  );
}
