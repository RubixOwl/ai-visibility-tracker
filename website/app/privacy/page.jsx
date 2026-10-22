/* Alpine Wave privacy page (T103). Every sentence traces to a source listed on the card
   (Alpine Wave/line/, card T103-privacy-page.md). Same fonts and colours as the homepage (sheet 7.1).

   CHAT_MODEL_ON: T104 sets this to match how the site chat goes live.
   true  = chat questions can be sent to the model provider (OpenAI, through our key proxy; lib/ai-response.mjs)
   false = prepared answers only, nothing sent to another company

   The phone number follows the homepage's one switch, PHONE_LIVE in components/site/Site.jsx (T108). */
import { PrivacyCallLine } from '../../components/site/Site';

const CHAT_MODEL_ON = false;

const EMAIL = 'hello@alpinewave.ca';
const UPDATED = 'October 2026';

export const metadata = {
  title: 'Privacy · Alpine Wave',
  description: 'What Alpine Wave collects, what we do with it, and who else sees it.',
  robots: { index: false, follow: false },
};

const CSS = `
body:has(.aw-privacy) { background: #0B1C2D; margin: 0; }
.aw-privacy {
  min-height: 100vh;
  background: linear-gradient(180deg, #0B1C2D 0%, #081624 60%, #06111C 100%);
  color: #FFFFFF;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 16.5px;
  line-height: 1.6;
}
.aw-privacy .bar { padding: 22px 36px; }
.aw-privacy .logo {
  display: inline-flex; align-items: center; gap: 10px;
  color: #FFFFFF; text-decoration: none;
  font-family: "Nunito", sans-serif; font-weight: 800; font-size: 20px;
}
.aw-privacy .logo svg { width: 36px; height: 24px; }
.aw-privacy article { max-width: 680px; margin: 0 auto; padding: 24px 16px 64px; }
.aw-privacy h1, .aw-privacy h2 { font-family: "Bricolage Grotesque", sans-serif; color: #FFFFFF; margin: 0; }
.aw-privacy h1 { font-size: clamp(34px, 6vw, 48px); font-weight: 800; line-height: 1.1; }
.aw-privacy .lede { font-size: 18.5px; color: #F4EDE5; margin: 14px 0 8px; }
.aw-privacy .updated { font-family: "JetBrains Mono", monospace; font-size: 13px; color: rgba(255, 255, 255, 0.6); margin: 0 0 32px; }
.aw-privacy section { padding: 22px 0; border-top: 1px solid rgba(255, 255, 255, 0.14); }
.aw-privacy h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
.aw-privacy p, .aw-privacy li { color: rgba(255, 255, 255, 0.86); margin: 0 0 10px; }
.aw-privacy ul { padding-left: 20px; margin: 0 0 10px; }
.aw-privacy a { color: #FFB597; }
.aw-privacy a[href^="tel:"] { white-space: nowrap; }
.aw-privacy a:hover { color: #FD632F; }
.aw-privacy .home {
  display: inline-block; margin-top: 18px; padding: 12px 22px; border-radius: 999px;
  background: #FD632F; color: #FFFFFF; font-weight: 700; text-decoration: none;
}
.aw-privacy .home:hover { background: #E14E1C; color: #FFFFFF; }
.aw-privacy footer { text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.55); padding: 0 16px 28px; }
@media (max-width: 600px) { .aw-privacy .bar { padding: 18px 16px; } }
`;

export default function Privacy() {
  return (
    <main className="aw-privacy">
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
        <h1>Privacy</h1>
        <p className="lede">What we collect, what we do with it, and who else sees it. We only use it to answer you and build your demo. We don&apos;t sell it.</p>
        <p className="updated">Last updated {UPDATED}</p>

        <section>
          <h2>Who we are</h2>
          <p>Alpine Wave Studio, Okanagan, British Columbia. Questions about your information? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a><PrivacyCallLine />.</p>
        </section>

        <section>
          <h2>The chat on this site</h2>
          {CHAT_MODEL_ON ? (
            <p>When you type a question, it goes to our website with the last few messages, so the answer makes sense. Some questions get a prepared answer. For the rest, we send your messages to OpenAI, an AI company, through our own account, and it writes the reply from our approved facts.</p>
          ) : (
            <p>When you type a question, it goes to our website with the last few messages, so the answer makes sense. Our website picks a prepared answer from our approved facts. Your messages aren&apos;t sent to any other company.</p>
          )}
          <p>Our website doesn&apos;t save the chat. It stays in your browser window, and refreshing or closing the page clears it. Please don&apos;t type card numbers, passwords or other private details.</p>
        </section>

        <section>
          <h2>The free demo form</h2>
          <p>Every &quot;Get your free demo&quot; button opens our demo page, which holds a Google Form. It asks for your name, your role, your shop&apos;s name and website, your email, and an optional note.</p>
          <p>Google stores your answers in our Google account. We use them only to build your demo and reply to you. We keep them for 12 months, then delete them. If you become a client, we keep them for as long as you&apos;re a client. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> to have yours deleted sooner.</p>
        </section>

        <section>
          <h2>Calls during a free trial</h2>
          <p>During a 7-day trial, your shop forwards the calls nobody picks up to our trial number. Only calls the bot answers are recorded, and every caller hears that at the start of the call. Calls your staff answer are never recorded.</p>
          <p>We use the recordings to fix the bot&apos;s facts and script for your shop. We don&apos;t use them to train an AI model. The calls run on Retell, the company behind our phone bot. Retell deletes the recordings and transcripts after 30 days.</p>
        </section>

        <section>
          <h2>Email</h2>
          <p>If you email us, we read it and we answer it.</p>
        </section>

        <section>
          <h2>What we don&apos;t do</h2>
          <ul>
            <li>We don&apos;t sell your information.</li>
            <li>This site has no ad tracking and no analytics.</li>
          </ul>
          <p>The site loads its fonts from Google Fonts, so Google sees your browser&apos;s internet address when a page opens.</p>
        </section>

        <section>
          <h2>Seeing or deleting your information</h2>
          <p>Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and tell us what you&apos;d like to see, fix or delete. We&apos;ll do it and reply within 30 days.</p>
          <a className="home" href="/">Back to Alpine Wave</a>
        </section>
      </article>

      <footer>© 2026 Alpine Wave Studio · Okanagan, British Columbia</footer>
    </main>
  );
}
