'use client';

import { useEffect, useRef, useState } from 'react';
import Chat from '../Chat';
import { Phone, Talk } from './Phone';
import SpiderPhone from './SpiderPhone';
import BenchPhone from './BenchPhone';
import CopyEmail from './CopyEmail';
import CallButton from './CallButton';
import HeroCable from './HeroCable';
import './site.css';

/* Alpine Wave homepage (T101). Every button on the page and where it goes (approved sheet 4.1-4.7).
   To change a destination, change one line in the constants just below this table.

   | Button                                            | Goes to                                                           | Sheet    |
   |---------------------------------------------------|-------------------------------------------------------------------|----------|
   | Get your free demo (every place + sticky bar)     | DEMO_URL: /demo page (Google Form embedded, T105)                 | 4.2      |
   | Try the chat (every place + top-right pill, T123) | opens the real site chat, components/Chat.jsx (#chat-drawer)      | 4.3      |
   | How It Works / Pricing nav links                  | #how-it-works / #pricing                                          | 4.4      |
   | Email                                             | EMAIL (mailto + Copy button, CopyEmail.jsx)                       | 4.5      |
   | Phone pill, phone number (5 PHONE SPOTs)          | switch PHONE_LIVE (below): off = the number is hidden everywhere  | 4.5      |
   |                                                   | (T108). On = PHONE / PHONE_URL (tel:...) shows in: 1 header pill, |          |
   |                                                   | 2 section 2 line, 3 counter phone (BenchPhone.jsx), 4 section 5   |          |
   |                                                   | contact line, 5 privacy page (PrivacyCallLine below)              |          |
   | Call us (section 2, PHONE SPOT 2)                 | PHONE_LIVE on = a PHONE_URL button in place of the plain line.    | 0.6a 4.6 |
   |                                                   | Turn on only after T49 passes                                     |          |
   | Book a call (sections 4 and 5)                    | switch BOOKING_URL (below): empty = button hidden. Olly's Google  | 0.6b 4.7 |
   |                                                   | Calendar booking page goes here once he has it                    |          |
*/
export const DEMO_URL = '/demo';
export const EMAIL = 'hello@alpinewave.ca';
export const EMAIL_URL = 'mailto:hello@alpinewave.ca';
export const PHONE = '(236) 760-3002';
export const PHONE_URL = 'tel:+12367603002';
// Turn on only after T49 passes. On = the number shows in all 5 PHONE SPOTs below and the Call us button replaces the plain line in spot 2.
export const PHONE_LIVE = true;
export const BOOKING_URL = 'https://calendar.app.google/5AbvYgbeKTSBDsfK9';

// Section 3: what it does when it can't help (sheet 5.3, 5.6, 6.1). Made-up shop, labelled.
const EMBARRASS_CALL = [
  ['caller', 'Can you hold the demo skis for me till Saturday?'],
  ['aw', "I can't hold gear, sorry. The shop's on 250-555-0100, open 9 till 5. They can sort it for you."],
  ['caller', 'Do you price-match?'],
  ['aw', "I don't have an answer for that, so I won't guess. The shop's on 250-555-0100, open 9 till 5."],
];

// Prices: sheet 2.1-2.5, data/alpine-wave/alpine-wave-services.json (pricing_and_commercials).
const PRICES = [
  ['Chat bot only', '100 interactions a month', '$77'],
  ['Phone bot only', '100 interactions a month', '$113'],
  ['Both bots', '100 interactions a month, shared', '$127'],
  ['Both bots', '200 interactions a month, 100 each', '$170'],
];

function Logo() {
  return (
    <a className="logo" href="#page-1" aria-label="Alpine Wave home">
      <svg viewBox="0 0 36 24" aria-hidden="true">
        <path d="M1 20 L12 5 L18 13 L22 8 L35 20" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M1 20 q4.25 -4 8.5 0 t8.5 0 t8.5 0 t8.5 0" fill="none" stroke="#FD632F" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      Alpine Wave
    </a>
  );
}

const Sep = () => <span className="sep">· </span>;

// The privacy page is a server page, so it can't read PHONE_LIVE from this client file; it renders this instead.
export function PrivacyCallLine() {
  /* PHONE SPOT 5 of 5: privacy page, "Who we are" ("or call ..."). Shows when PHONE_LIVE is on (T49). */
  return PHONE_LIVE ? <> or call <a href={PHONE_URL}>{PHONE}</a></> : null;
}

export default function Site() {
  const [chatOpen, setChatOpen] = useState(false);
  const [dockOn, setDockOn] = useState(false);
  const heroDock = useRef(null);
  const openChat = () => setChatOpen(true);

  // The sticky "Get your free demo" shows once page 1's own buttons have scrolled out of view.
  useEffect(() => {
    const watch = new IntersectionObserver(([entry]) => setDockOn(!entry.isIntersecting));
    watch.observe(heroDock.current);
    return () => watch.disconnect();
  }, []);

  return (
    <>
      <main className="aw-site">
        {/* PAGE 1: the gondola photo, with the phones riding the cable on wider screens (HeroCable, T123).
            Mark's layout (T123): centred nav, two-line headline, one demo button, chat pill top-right. Sheet 0.2; no prices here (0.4) */}
        <section className="hero-fullscreen" id="page-1">
          <HeroCable />
          <div className="hero-overlay" />
          <header className="top-bar">
            <Logo />
            <nav className="nav-center" aria-label="Main">
              <a className="nav-link" href="#how-it-works">How It Works</a>
              <a className="nav-link" href="#pricing">Pricing</a>
            </nav>
            <div className="nav-right">
              {/* PHONE SPOT 1 of 5: header pill. Shows when PHONE_LIVE is on (T49). On a computer the click shows the number (CallButton, T124). */}
              {PHONE_LIVE && <CallButton className="nav-phone-pill" phone={PHONE} href={PHONE_URL}><span className="dot" />{PHONE}</CallButton>}
            </div>
          </header>

          <div className="tagline-banner">
            <h1 className="main-tagline">We answer your phone,<br />so you don&rsquo;t have to.</h1>
            <p className="sub-tagline">Stay with the customer in front of you. We&apos;ll answer the ones on the phone.</p>
          </div>

          <div className="hero-stage">
            <div className="hero-dock" ref={heroDock}>
              <a href={DEMO_URL} className="btn-primary">Get your free demo →</a>
            </div>
          </div>
        </section>

        {/* SECTION 2: their day at the counter. Sheet 6.1, 6.5, 5.8, 4.3, 0.6a */}
        <section className="scene scene-day" id="how-it-works">
          <div className="scene-words">
            <h2>You&apos;re mid-fitting. The phone rings. Again.</h2>
            <p className="scene-pain">Sunday hours. Kids&apos; rentals. &quot;How long for a tune?&quot; You let it ring, because the customer in front of you comes first.</p>
            <p className="scene-fix">Alpine Wave picks up and answers those questions for you.</p>
            <p className="scene-how">It answers from your own shop&apos;s details, the ones on your website. If it doesn&apos;t know, it says so and gives your customer your number and hours.</p>
          </div>

          <SpiderPhone />

          <div className="scene-ask spider-ask">
            <button className="btn-scene" type="button" onClick={openChat}>
              Try the chat <small><Sep />ask it what your customers ask</small>
            </button>
            {/* PHONE SPOT 2 of 5: section 2, Call us button (off: the email line alone). Shows when PHONE_LIVE is on (T49). On a computer the click shows the number (CallButton, T124). */}
            {PHONE_LIVE ? (
              <CallButton className="btn-scene btn-outline" phone={PHONE} href={PHONE_URL} place="above">Call us <small><Sep />hear it answer</small></CallButton>
            ) : (
              <span className="call-line">Questions? <CopyEmail email={EMAIL} /></span>
            )}
          </div>
        </section>

        {/* SECTION 3: "Will it embarrass me?" Sheet 6.1, 5.6, 1.3, 6.5, 5.3 (never promises a spot), 5.8, 4.2 */}
        <section className="scene scene-ridge" id="embarrass">
          <div className="scene-words">
            <h2>Will it embarrass me?</h2>
            <p className="scene-pain">A wrong price. The wrong hours. A promise you can&apos;t keep. That&apos;s the worry, and it&apos;s a fair one.</p>
            <p className="scene-fix">It only says what you&apos;ve approved. When it doesn&apos;t know, it says so and gives the shop&apos;s own number and hours.</p>
            <p className="scene-how">You see it on your own shop&apos;s facts first, in a free demo. Nothing goes on your site unless you say so.</p>
            <p className="scene-aside">Run tours or rentals too? Same idea: it answers from your tour page while you&apos;re out guiding, and never promises a spot.</p>
            <div className="scene-ask">
              <a className="btn-scene" href={DEMO_URL}>Get your free demo <small><Sep />see it on your own shop&apos;s facts</small></a>
            </div>
          </div>
          <Phone><Talk lines={EMBARRASS_CALL} /></Phone>
        </section>

        {/* WE GET IT: the owner at work (sheet 0.7). Boot-fitting photo, shop signs cropped off; the phone on the counter is live (Olly 10-18) */}
        <section className="scene scene-shop" id="we-get-it">
          {/* PHONE SPOT 3 of 5: counter phone picture, number line under LIVE ASSISTANT (BenchPhone.jsx). Shows when PHONE_LIVE is on (T49). */}
          <BenchPhone phone={PHONE_LIVE ? PHONE : null} />
          <div className="scene-words">
            <h2>You love the work. Not the ringing.</h2>
            <p className="scene-pain">The boot that needs one more tweak. The family who drove an hour to get the kids fitted. That&apos;s the job, and you&apos;re good at it.</p>
            <p className="scene-fix">The phone that won&apos;t stop while you do it? We&apos;ve got that. The customer in front of you gets all of you.</p>
            <div className="scene-ask">
              <a className="btn-scene" href={DEMO_URL}>Get your free demo <small><Sep />built from your own website</small></a>
            </div>
          </div>
        </section>

        {/* SECTION 4: try it on your own shop first. Sheet 1.3, 1.3a, 1.3b, 6.3, 6.4, 6.5, 4.2, 4.7 */}
        <section className="scene scene-bluebird" id="try-it">
          <div className="scene-words">
            <h2>Try it on your own shop first.</h2>
            <p className="scene-pain">You wouldn&apos;t sell someone a boot without a fitting. So we won&apos;t ask you to buy this blind.</p>
            <ol className="trail">
              <li>
                <h3>Free demo</h3>
                <p>We build it from your public website and send you a private link and number. Ask it what your customers ask.</p>
              </li>
              <li>
                <h3>Free 7-day trial</h3>
                <p>It answers the calls nobody picks up, when you&apos;re busy or closed. You forward your own line, so no new phone system, no passwords. On day 7 you get a report of what it did.</p>
              </li>
              <li>
                <h3>Monthly plan</h3>
                <p>Happy with it? It answers all your calls, day and night.</p>
              </li>
            </ol>
            <div className="scene-ask">
              <a className="btn-scene" href={DEMO_URL}>Get your free demo</a>
              {BOOKING_URL && (
                <a className="btn-scene btn-outline" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a call <small><Sep />talk it through first</small></a>
              )}
            </div>
          </div>
          <Phone name="Your day-7 report" sub="from Alpine Wave">
            <ul className="report">
              <li>Calls and chats it took</li>
              <li>How many came after hours</li>
              <li>What it answered, and what it passed to you</li>
              <li>Your top questions<span>Sunday hours · kids&apos; rentals · tune times</span></li>
              <li>What we fixed along the way</li>
            </ul>
          </Phone>
        </section>

        {/* SECTION 5: what does it cost? Sheet 2.1-2.6, 1.4, 3.1-3.3, 4.2, 4.5, 4.7 */}
        <section className="scene scene-base" id="pricing">
          <div className="scene-words">
            <h2>What does it cost?</h2>
            <p className="scene-pain">Fair question. Here it is, straight up.</p>
            <div className="price-board">
              {PRICES.map(([item, detail, price]) => (
                <div className="board-row" key={item + detail}>
                  <span className="item">{item}<small>{detail}</small></span><span className="dots" /><span className="price">{price}</span>
                </div>
              ))}
              <p className="board-note">CAD, plus GST, per month. One interaction is one call or chat of up to 3 minutes.</p>
              <p className="launch-note"><b>Launch offer:</b> the first 3 shops get no setup fee and half price for the first 3 months.</p>
            </div>
            <p className="scene-how">Not sure which fits? We&apos;ll be able to properly evaluate cost after we know your volume.</p>
            <div className="scene-ask">
              {BOOKING_URL && (
                <a className="btn-scene" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a call <small><Sep />what fits my shop?</small></a>
              )}
              <a className={`btn-scene${BOOKING_URL ? ' btn-outline' : ''}`} href={DEMO_URL}>Get your free demo</a>
            </div>
            {/* PHONE SPOT 4 of 5: section 5 contact line, after the email. Shows when PHONE_LIVE is on (T49). */}
            <p className="contact-line"><CopyEmail email={EMAIL} />{PHONE_LIVE && <> · <a href={PHONE_URL}>{PHONE}</a></>}</p>
          </div>
          <footer className="site-foot">© 2026 Alpine Wave Studio · Okanagan, British Columbia · <a href="/privacy" style={{ color: 'inherit' }}>Privacy</a></footer>
        </section>

        {/* Fixed top-right from page load, stays put while scrolling (Mark's layout, T123) */}
        <button type="button" className="aw-launcher" onClick={() => setChatOpen(open => !open)}>
          Try the chat
        </button>
        {/* Stays within reach while scrolling (Olly 10-17). A bar along the bottom on phones */}
        <div className={`demo-dock${dockOn ? ' show' : ''}`}>
          <a className="dock-demo" href={DEMO_URL}>Get your free demo</a>
          <button className="dock-chat" type="button" onClick={openChat}>Try the chat</button>
        </div>
      </main>

      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
