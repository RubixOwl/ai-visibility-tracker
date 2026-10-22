/* Alpine Wave free demo page (T105). Every "Get your free demo" button on the homepage comes here
   (DEMO_URL in components/site/Site.jsx). Olly's Google Form "Free demo for my shop" sits inside the page,
   so a shop owner never leaves the site. Same fonts and colours as the homepage (sheet 7.1).
   Intro wording: Olly's own, from his booking page. No prices or timings here.

   Frame height: Google forms don't resize themselves. Measured 2026-10-19 (6 questions + submit):
   1408px at a 358px-wide frame (390px phone), 1345px at 640px. Each height leaves ~110px for the red
   "This is a required question" lines Google adds on a failed submit. Re-measure if the questions change.
   After a send, FormFrame.jsx switches to .sent: just Google's "Your response has been recorded" card. */
import FormFrame from './FormFrame';
import CopyEmail from '../../components/site/CopyEmail';

const DEMO_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScVu_bu3UdAEI-VaWIUPeXSInK1CHNey-cJJhIQ7IUqCmcqTg/viewform';
const EMAIL = 'hello@alpinewave.ca';

export const metadata = {
  title: 'Free demo · Alpine Wave',
  description: "Ask for a free demo built from your shop's public website. No passwords or logins needed.",
};

const CSS = `
body:has(.aw-demo) { background: #0B1C2D; margin: 0; }
.aw-demo {
  position: relative;
  min-height: 100vh;
  color: #FFFFFF;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 16.5px;
  line-height: 1.6;
}
/* Backdrop: the homepage's page 1-2 mountains (section 2's photo, page 1's view without the gondola phones).
   Held still while the form scrolls over it; a fixed layer, since background-attachment: fixed fails on iPhones */
.aw-demo::before {
  content: ""; position: fixed; inset: 0; z-index: -1;
  background:
    linear-gradient(180deg, rgba(11, 28, 45, .82) 0%, rgba(8, 21, 35, .5) 35%, rgba(8, 21, 35, .35) 70%, rgba(11, 28, 45, .9) 100%),
    url('/site/continuous-alpine-backdrop.jpg') center 62% / cover no-repeat;
}
.aw-demo h1, .aw-demo .intro p, .aw-demo .fallback { text-shadow: 0 1px 10px rgba(8, 21, 35, .7); }
.aw-demo .fallback { background: rgba(8, 21, 35, .6); border-radius: 999px; padding: 10px 18px; }
.aw-demo .bar { padding: 22px 36px; }
.aw-demo .logo {
  display: inline-flex; align-items: center; gap: 10px;
  color: #FFFFFF; text-decoration: none;
  font-family: "Nunito", sans-serif; font-weight: 800; font-size: 20px;
}
.aw-demo .logo svg { width: 36px; height: 24px; }
.aw-demo article { max-width: 680px; margin: 0 auto; padding: 24px 16px 48px; }
.aw-demo h1 { color: #FD632F; font-family: "Bricolage Grotesque", sans-serif; font-size: clamp(34px, 6vw, 48px); font-weight: 800; line-height: 1.1; margin: 0; }
.aw-demo .intro { margin: 16px 0 28px; }
.aw-demo .intro p { font-size: 18px; color: #F4EDE5; margin: 0 0 6px; }
.aw-demo .form-card { background: #FD632F; border-radius: 24px; padding: 20px 0; }
.aw-demo .form-card { scroll-margin-top: 24px; }
.aw-demo iframe, .aw-demo .frame-wait { display: block; width: 100%; max-width: 640px; height: 1460px; margin: 0 auto; border: 0; }
.aw-demo .sent iframe { height: 310px; }
.aw-demo .fallback { text-align: center; color: rgba(255, 255, 255, 0.8); margin: 22px 0 0; }
.aw-demo .fallback a { color: #FFB597; }
.aw-demo .fallback a:hover { color: #FD632F; }
.aw-demo .copy-email { white-space: nowrap; }
.aw-demo .copy-btn {
  margin-left: 8px; padding: 2px 11px; border-radius: 999px; vertical-align: 1px;
  border: 1.5px solid #FD632F; background: transparent; color: #FFFFFF;
  font: 600 13px/1.4 "Hanken Grotesk", sans-serif; cursor: pointer;
}
.aw-demo .copy-btn:hover { background: #FD632F; }
.aw-demo .home {
  display: inline-block; margin-top: 18px; padding: 12px 22px; border-radius: 999px;
  border: 2px solid #FD632F; color: #FFFFFF; font-weight: 700; text-decoration: none;
}
.aw-demo .home:hover { background: #FD632F; }
.aw-demo .back { text-align: center; }
.aw-demo footer { text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.55); padding: 0 16px 28px; }
@media (max-width: 600px) {
  .aw-demo .bar { padding: 18px 16px; }
  .aw-demo::before {
    background:
      linear-gradient(180deg, rgba(11, 28, 45, .85) 0%, rgba(8, 21, 35, .62) 45%, rgba(8, 21, 35, .35) 75%, rgba(11, 28, 45, .9) 100%),
      url('/site/continuous-alpine-backdrop.jpg') 40% center / cover no-repeat;
  }
  .aw-demo .form-card { padding: 12px 0; border-radius: 18px; }
  .aw-demo iframe, .aw-demo .frame-wait { height: 1520px; }
  .aw-demo .sent iframe { height: 410px; }
}
`;

export default function Demo() {
  return (
    <main className="aw-demo">
      <style>{CSS}</style>
      <header className="bar">
        <a className="logo" href="/" aria-label="Alpine Wave home">
          <svg viewBox="0 0 36 24" aria-hidden="true">
            <path d="M1 20 L12 5 L18 13 L22 8 L35 20" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M1 20 q4.25 -4 8.5 0 t8.5 0 t8.5 0 t8.5 0" fill="none" stroke="#FD632F" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          Alpine Wave
        </a>
      </header>

      <article>
        <h1>Get your free demo</h1>
        <div className="intro">
          <p>A free demo built from your shop&apos;s public website, sent as a private link and number.</p>
          <p>Then a free 7-day trial, where we monitor the bots&apos; interactions. Then a monthly plan if it&apos;s right for you.</p>
          <p>No passwords or logins needed, and nothing goes on your site unless you say so.</p>
        </div>

        <FormFrame src={`${DEMO_FORM_URL}?embedded=true`} />

        <p className="fallback">
          Form not loading? Email <CopyEmail email={EMAIL} />
        </p>
        <p className="back"><a className="home" href="/">Back to Alpine Wave</a></p>
      </article>

      <footer>© 2026 Alpine Wave Studio · Okanagan, British Columbia</footer>
    </main>
  );
}
