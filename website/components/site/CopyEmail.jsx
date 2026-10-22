'use client';

import { useState } from 'react';

/* The email address with a Copy button (Olly 10-19). The address stays a mailto link, which opens the mail app
   on phones; Copy is for computers with no mail app set up, where mailto only opens a "pick an app" prompt. */
export default function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Older browsers, or clipboard blocked: copy through a hidden text box
      const box = document.createElement('textarea');
      box.value = email;
      document.body.appendChild(box);
      box.select();
      document.execCommand('copy');
      box.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="copy-email">
      <a href={`mailto:${email}`}>{email}</a>
      <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy ${email}`}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </span>
  );
}
