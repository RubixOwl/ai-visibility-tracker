'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Chat from './Chat';

const audienceCopy = {
  platform: {
    tagline: '24/7 phone & website assistants for seasonal businesses',
    lede: 'Peak season should mean serving the people in front of you, not answering the same five calls all morning. Alpine Wave answers phone and website questions from your approved business information, points guests to your booking page, and passes anything unusual to your staff.',
    placeholder: 'Try: “How long does a tune-up take?”'
  },
  ski: {
    tagline: 'Phone & website assistants for ski and board shops',
    lede: "Pickup times, tune turnaround, what's in a rental package, the Saturday 8 am phone rush: Alpine Wave answers the routine questions so your techs stay on the floor, and sends sizing and safety questions to your staff.",
    placeholder: 'Try: “Can I pick up my rentals the night before?”'
  }
};

const spiderNodes = [
  { side: 'a', q: 'What are your opening hours?', label: 'Answers · Hours', intent: 'hours', top: 6, off: 11 },
  { side: 'a', q: 'How long does a tune-up take?', label: 'Answers · Service times', intent: 'tune', top: 30, off: 4 },
  { side: 'a', q: 'Is lunch included on the tour?', label: "Answers · What's included", intent: 'lunch', top: 54, off: 4 },
  { side: 'a', q: 'Can I cancel if the weather turns?', label: 'Answers · Policies', intent: 'cancel', top: 78, off: 11 },
  { side: 'b', q: 'Can I book for Saturday morning?', label: 'Sends · Booking link', intent: 'book', top: 6, off: 11 },
  { side: 'b', q: 'Can we book for a group of 14?', label: 'Hands off · To manager', intent: 'group', top: 30, off: 4 },
  { side: 'b', q: 'Can someone call me back tomorrow?', label: 'Captures · Callback', intent: 'callback', top: 54, off: 4 },
  { side: 'b', q: 'Will it snow this weekend?', label: "Won't guess", intent: null, top: 78, off: 11 }
];

const spiderIntents = {
  hours: {
    k: ['open', 'opening', 'close', 'hours', 'sunday', 'holiday'],
    a: "We're open 8 am to 6 pm every day in season, holidays included.",
    src: 'Hours · sample info'
  },
  tune: {
    k: ['tune', 'wax', 'sharpen', 'repair', 'service'],
    a: "Drop it off before 5 pm and it's ready by 8 am the next morning. Rush tunes take about 2 hours.",
    src: 'Workshop · sample info'
  },
  lunch: {
    k: ['lunch', 'food', 'meal', 'included', 'include'],
    a: "Full-day tours include a picnic lunch. Half-day tours include snacks and drinks.",
    src: "What's included · sample info"
  },
  cancel: {
    k: ['cancel', 'refund', 'change', 'reschedule', 'weather'],
    a: "Cancel or change up to 48 hours before for a full refund. If we cancel for weather, you choose a new date or a refund.",
    src: 'Policy · sample info'
  },
  book: {
    k: ['book', 'reserve', 'saturday', 'availability', 'spot'],
    tag: 'Booking link sent',
    a: "You can pick a time and pay on our booking page. I've sent you the link.",
    src: 'Booking page · sample'
  },
  group: {
    k: ['group', '14', 'corporate', 'large', 'private'],
    hand: true,
    tag: 'Passed to manager',
    a: "Groups of 10 or more are arranged by our manager. What's the best number to reach you?"
  },
  callback: {
    k: ['call me', 'callback', 'call back', 'someone call', 'tomorrow'],
    hand: true,
    tag: 'Callback captured',
    a: "Sure. What's your name and number? I'll have someone call you when we open at 8 am."
  }
};

const questionsData = [
  {
    cat: 'gear',
    badge: 'Gear & Rentals',
    query: '"Can we pick up our ski rentals the night before?"',
    answer: '"Yes! Complimentary early pickup is available between 4:00 PM and 6:30 PM so you can head straight to the lift in the morning."'
  },
  {
    cat: 'weather',
    badge: 'Weather & Safety',
    query: '"What happens if there is smoke or poor air quality?"',
    answer: '"If the Air Quality Health Index reaches 7 or higher, outdoor activities can be rescheduled or cancelled with full credit at your discretion."'
  },
  {
    cat: 'booking',
    badge: 'Bookings',
    query: '"Do minors need parental signatures on the digital waiver?"',
    answer: '"Yes, all guests under 19 in British Columbia require a parent or legal guardian\'s signature on our online waiver prior to departure."'
  },
  {
    cat: 'gear',
    badge: 'Gear & Rentals',
    query: '"Do you provide avalanche transceivers and probes?"',
    answer: '"Backcountry packages include Mammut Barryvox beacons, probes, and shovels. We conduct a mandatory battery and beacon check before handover."'
  },
  {
    cat: 'weather',
    badge: 'Tours & Conditions',
    query: '"What should we wear for the lake boat cruise?"',
    answer: '"Layers are recommended! Even on warm Okanagan afternoons, breezes off the water cool quickly once the sun dips behind the ridge."'
  },
  {
    cat: 'booking',
    badge: 'Bookings',
    query: '"Can we change the date of our wine tour reservation?"',
    answer: '"Modifications made at least 48 hours prior to departure are processed with zero penalty fees, subject to winery tasting room availability."'
  }
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [audience, setAudience] = useState('platform');
  const [promptInput, setPromptInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Phone Mockup in Spider Map state
  const [spiderMessages, setSpiderMessages] = useState([
    { role: 'u', text: 'Is lunch included on the full-day tour?' },
    { role: 'a', text: 'Yes! Full-day tours include a picnic lunch. Half-day tours include snacks.', src: "Inclusions · sample info" },
    { role: 'u', text: 'Can we book a private trip for 14 guests?' },
    { role: 'a', hand: true, tag: 'Passed to manager', text: "Groups of 10+ are arranged by our manager. What's the best number to reach you?" }
  ]);
  const [activeSpiderIndex, setActiveSpiderIndex] = useState(0);

  // Video State
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoTimeDisplay, setVideoTimeDisplay] = useState('0:00 / 0:28');

  // Speech Call State
  const [speechActive, setSpeechActive] = useState(false);

  // Refs for spider diagram
  const sunRef = useRef(null);
  const rayGRef = useRef(null);
  const phoneRef = useRef(null);
  const nodeRefs = useRef([]);
  const chatRef = useRef(null);
  const spiderBusyRef = useRef(false);
  const spiderAutoRef = useRef(null);
  const spiderAiRef = useRef(0);
  const spiderPathsRef = useRef([]);

  const openChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  // Audience copy selection
  const currentCopy = audienceCopy[audience];

  // Spider ray rendering
  const drawSpiderRays = useCallback(() => {
    if (!rayGRef.current || !sunRef.current || !phoneRef.current) return;
    rayGRef.current.innerHTML = '';
    spiderPathsRef.current = [];
    if (window.innerWidth <= 860) return;

    const S = sunRef.current.getBoundingClientRect();
    const P = phoneRef.current.getBoundingClientRect();
    const SVG_NS = 'http://www.w3.org/2000/svg';

    nodeRefs.current.forEach((b, i) => {
      if (!b) return;
      const r = b.getBoundingClientRect();
      const left = spiderNodes[i].side === 'a';
      const x1 = (left ? r.right : r.left) - S.left;
      const y1 = r.top + r.height / 2 - S.top;
      const rank = [0.2, 0.4, 0.6, 0.8][i % 4];
      const x2 = (left ? P.left : P.right) - S.left;
      const y2 = P.top - S.top + P.height * rank;
      const dx = (x2 - x1) * 0.55;
      const d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;

      const base = document.createElementNS(SVG_NS, 'path');
      base.setAttribute('d', d);
      base.setAttribute('class', 'ray');

      const shim = document.createElementNS(SVG_NS, 'path');
      shim.setAttribute('d', d);
      shim.setAttribute('class', 'shim');
      shim.style.animationDelay = `${-i * 0.4}s`;

      rayGRef.current.appendChild(base);
      rayGRef.current.appendChild(shim);
      spiderPathsRef.current.push(base);
    });
  }, []);

  const stopSpiderAuto = useCallback(() => {
    if (spiderAutoRef.current) {
      clearInterval(spiderAutoRef.current);
      spiderAutoRef.current = null;
    }
  }, []);

  const travelSpider = useCallback((pathEl) => {
    if (!pathEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    return new Promise(resolve => {
      const len = pathEl.getTotalLength();
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '4');
      dot.setAttribute('class', 'packet');
      rayGRef.current?.appendChild(dot);
      const start = performance.now();
      const dur = 420;
      function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const pt = pathEl.getPointAtLength(t * len);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          dot.remove();
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, []);

  const fireSpider = useCallback(async (idx, textOverride) => {
    if (spiderBusyRef.current) return;
    spiderBusyRef.current = true;
    setActiveSpiderIndex(idx);

    const isCustom = idx < 0;
    const node = !isCustom ? spiderNodes[idx] : null;
    const intentId = node ? node.intent : (() => {
      const s = (textOverride || '').toLowerCase();
      for (const id of ['group', 'callback', 'book', 'cancel', 'tune', 'lunch', 'hours']) {
        if (spiderIntents[id].k.some(w => s.includes(w))) return id;
      }
      return null;
    })();

    const questionText = textOverride || (node ? node.q : '');
    const pathEl = !isCustom && spiderPathsRef.current[idx] ? spiderPathsRef.current[idx] : null;

    if (pathEl) {
      pathEl.classList.add('on');
      await travelSpider(pathEl);
      setTimeout(() => pathEl.classList.remove('on'), 1200);
    }

    const reply = intentId && spiderIntents[intentId] ? spiderIntents[intentId] : {
      hand: true,
      tag: "Won't guess",
      a: "I don't have that in our information, so I won't guess. Want me to pass your question to the team?"
    };

    setSpiderMessages(prev => [
      ...prev.slice(-6),
      { role: 'u', text: questionText },
      { role: 'a', hand: reply.hand, tag: reply.tag, text: reply.a, src: reply.src }
    ]);

    setTimeout(() => {
      spiderBusyRef.current = false;
    }, 850);
  }, [travelSpider]);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    drawSpiderRays();
    window.addEventListener('resize', drawSpiderRays);

    if (!isReduced) {
      const seq = [0, 5, 2, 6, 3, 4, 1, 7];
      spiderAutoRef.current = setInterval(() => {
        fireSpider(seq[spiderAiRef.current % seq.length]);
        spiderAiRef.current++;
      }, 4400);
      setTimeout(() => {
        fireSpider(seq[0]);
        spiderAiRef.current = 1;
      }, 1000);
    }

    return () => {
      window.removeEventListener('resize', drawSpiderRays);
      if (spiderAutoRef.current) clearInterval(spiderAutoRef.current);
    };
  }, [drawSpiderRays, fireSpider]);

  // Prompt submit from Hero
  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const val = promptInput.trim();
    if (!val) return;
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    stopSpiderAuto();
    fireSpider(-1, val);
  };

  // Video functions
  const toggleMainVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = false;
      setVideoMuted(false);
      video.play().then(() => {
        setVideoPlaying(true);
      }).catch(() => {
        video.muted = true;
        setVideoMuted(true);
        video.play();
        setVideoPlaying(true);
      });
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setVideoMuted(video.muted);
    if (!video.muted && video.paused) {
      video.play();
      setVideoPlaying(true);
    }
  };

  const toggleVideoFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setVideoProgress(pct);
    const curMins = Math.floor(video.currentTime / 60);
    const curSecs = Math.floor(video.currentTime % 60);
    const durMins = Math.floor(video.duration / 60) || 0;
    const durSecs = Math.floor(video.duration % 60) || 0;
    setVideoTimeDisplay(`${curMins}:${curSecs < 10 ? '0' : ''}${curSecs} / ${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`);
  };

  const seekVideo = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const scrollToVideoAndPlay = () => {
    const vidSection = document.getElementById('video');
    if (vidSection) {
      vidSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          video.muted = false;
          setVideoMuted(false);
          video.play().then(() => setVideoPlaying(true)).catch(() => {});
        }
      }, 600);
    }
  };

  // Speech Call Demo
  const playVoiceCall = () => {
    if (!('speechSynthesis' in window)) {
      alert("Audio playback is not supported in this browser, but you can read the sample transcript on screen!");
      return;
    }

    if (speechActive) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechActive(true);

    const guestText = "Hi! If the temperature drops below minus 20, do the guided snowmobile tours still run?";
    const botText = "Yes, tours run down to minus 25, and we supply heated grips and full winter suits. If weather closes the trail, you can reschedule for free or get a full refund.";

    const utter1 = new SpeechSynthesisUtterance(guestText);
    utter1.rate = 1.05;
    utter1.pitch = 1.1;

    const utter2 = new SpeechSynthesisUtterance(botText);
    utter2.rate = 1.0;
    utter2.pitch = 0.95;

    utter1.onend = () => {
      window.speechSynthesis.speak(utter2);
    };

    utter2.onend = () => {
      setSpeechActive(false);
    };

    utter1.onerror = () => setSpeechActive(false);
    utter2.onerror = () => setSpeechActive(false);

    window.speechSynthesis.speak(utter1);
  };

  const filteredQuestions = questionsData.filter(
    q => activeCategory === 'all' || q.cat === activeCategory
  );

  return (
    <>
      <a className="skip-link sr-only" href="#top">Skip to content</a>

      {/* Top Announcement Bar */}
      <div className="promo-banner">
        <span className="tag">Free demo</span>
        <span>See an assistant built from your own website. No passwords or system access needed.</span>
        <a href="#tier1">How it works <span aria-hidden="true">→</span></a>
      </div>

      {/* Sticky Main Navigation */}
      <nav className="main-nav" aria-label="Main">
        <div className="container-wide nav-inner">
          <a href="#top" className="brand-logo" aria-label="Alpine Wave home">
            <svg viewBox="0 0 36 24" aria-hidden="true">
              <path d="M1 20 L12 5 L18 13 L22 8 L35 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M1 20 q4.25 -4 8.5 0 t8.5 0 t8.5 0 t8.5 0" fill="none" stroke="var(--vibrant-poppy)" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            <span>Alpine Wave</span>
          </a>

          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#channels">What you get</a>
            <a href="#questions">Examples</a>
            <a href="#safeguards">Safeguards</a>
            <a href="#tier1">Plans</a>
          </div>

          <button className="btn btn-poppy btn-sm nav-cta" type="button" onClick={openChat}>
            Try the assistant <span className="arr">→</span>
          </button>
        </div>
      </nav>

      {/* ==========================================================================
          HERO CANVAS: GIVINGLI-STYLE MONUMENTAL CENTERED TYPE
          ========================================================================== */}
      <header className="hero-canvas" id="top">
        <div className="container hero-center">
          <div className="audience-toggle" role="group" aria-label="Show examples for">
            <button
              className={`toggle-opt${audience === 'platform' ? ' active' : ''}`}
              id="btn-platform"
              aria-pressed={audience === 'platform'}
              onClick={() => setAudience('platform')}
              type="button"
            >
              Any seasonal business
            </button>
            <button
              className={`toggle-opt${audience === 'ski' ? ' active' : ''}`}
              id="btn-ski"
              aria-pressed={audience === 'ski'}
              onClick={() => setAudience('ski')}
              type="button"
            >
              🎿 Ski &amp; board shops
            </button>
          </div>

          <div className="eyebrow-pill">
            <span className="sparkle">✦</span>
            <span id="hero-tagline">{currentCopy.tagline}</span>
          </div>

          <h1 className="hero-h1">
            Your phone &amp; website answer every customer, <br />
            <span className="accent-word">instantly.</span>
          </h1>

          <p className="hero-lede" id="hero-lede-text">
            {currentCopy.lede}
          </p>

          {/* Question Prompt Bar */}
          <div className="prompt-bar-wrap">
            <form className="prompt-bar" onSubmit={handlePromptSubmit}>
              <span className="prompt-icon" aria-hidden="true">🔍</span>
              <label htmlFor="demo-prompt-input" className="sr-only">Ask a sample question</label>
              <input
                type="text"
                id="demo-prompt-input"
                className="prompt-input"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder={currentCopy.placeholder}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-poppy btn-sm">Ask <span className="arr">→</span></button>
            </form>
          </div>

          <div className="hero-actions">
            <button className="btn btn-poppy" type="button" onClick={openChat}>
              Chat with Alpine Wave <span className="arr">→</span>
            </button>
            <a href="#how-it-works" className="btn btn-white">
              <span>⚡ See how it works</span>
            </a>
            <a href="tel:+12362057030" className="btn btn-white">
              <span>📞 (236) 205-7030</span>
            </a>
          </div>

          <ul className="proof-chips" aria-label="Key facts">
            <li><span className="legend-dot orange"></span>Website + phone, one setup</li>
            <li><span className="legend-dot orange"></span>Answers only from info you approve</li>
            <li><span className="legend-dot orange"></span>Built in the Okanagan, BC</li>
          </ul>
        </div>
      </header>

      {/* ==========================================================================
          SECTION 02: INTERACTIVE SPIDER MAP (INTELLIGENCE HUB)
          ========================================================================== */}
      <section className="spider-section" id="how-it-works">
        <div className="container">
          <div className="spider-header">
            <div className="eyebrow-pill">
              <span className="sparkle">✦</span>
              <span>How it works</span>
            </div>
            <h2 className="section-h2">Every question gets the right next step.</h2>
            <p className="section-lede">
              Your website chat and phone line share one brain, built from the information you approve. It answers what it knows, sends people to your booking page, takes callback details, and passes anything unusual to your staff. If it doesn't know, it says so.
            </p>
            <div className="spider-instructions-pill">
              <span className="live-indicator"></span>
              <span>Click a question to see how the assistant handles it</span>
            </div>
          </div>

          {/* Sun Spider Diagram */}
          <div className="sun" id="sun" ref={sunRef}>
            <svg className="rays" id="rays" aria-hidden="true">
              <defs>
                <linearGradient id="shimGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFE5D9" />
                  <stop offset="0.5" stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#FD632F" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g id="rayG" ref={rayGRef}></g>
            </svg>

            {/* Left Node Cluster (Group A) */}
            <div className="nodes-a" id="nodesA">
              {spiderNodes.slice(0, 4).map((node, i) => (
                <button
                  key={i}
                  ref={el => (nodeRefs.current[i] = el)}
                  type="button"
                  className={`node${activeSpiderIndex === i ? ' on' : ''}`}
                  style={{ top: `${node.top}%`, left: `${node.off}%` }}
                  onClick={() => {
                    stopSpiderAuto();
                    fireSpider(i);
                  }}
                >
                  <small>{node.label}</small>
                  {node.q}
                </button>
              ))}
            </div>

            {/* Central Phone Hub */}
            <div className="hub">
              <span className="shoptag">Your business</span>
              <div className="phone" ref={phoneRef} aria-label="Sample assistant conversation">
                <span className="notch"></span>
                <div className="top">
                  <span className="dot"></span>
                  <span>Your assistant</span>
                  <span className="sample-tag" style={{ marginLeft: 'auto', padding: '2px 7px', fontSize: '9px' }}>Sample</span>
                </div>
                <div className="msgs" id="pmsgs" aria-live="polite">
                  {spiderMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`b ${msg.role === 'u' ? 'u' : 'a'}${msg.hand ? ' hand' : ''}`}
                    >
                      {msg.tag && <><span className="tag">{msg.tag}</span><br /></>}
                      {msg.text}
                      {msg.src && <span className="src">{msg.src}</span>}
                    </div>
                  ))}
                </div>
                <div className="bar" onClick={openChat} role="button" tabIndex={0}>
                  <span>Message the business…</span>
                  <i>↑</i>
                </div>
              </div>
            </div>

            {/* Right Node Cluster (Group B) */}
            <div className="nodes-b" id="nodesB">
              {spiderNodes.slice(4, 8).map((node, i) => {
                const globalIndex = i + 4;
                return (
                  <button
                    key={globalIndex}
                    ref={el => (nodeRefs.current[globalIndex] = el)}
                    type="button"
                    className={`node${activeSpiderIndex === globalIndex ? ' on' : ''}`}
                    style={{ top: `${node.top}%`, right: `${node.off}%` }}
                    onClick={() => {
                      stopSpiderAuto();
                      fireSpider(globalIndex);
                    }}
                  >
                    <small>{node.label}</small>
                    {node.q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spider Legend */}
          <div className="spider-legend-bar">
            <div className="legend-chip">
              <span className="legend-dot green"></span>
              <span><strong>Answered:</strong> hours, turnaround times, what's included, policies, booking links</span>
            </div>
            <div className="legend-chip">
              <span className="legend-dot orange"></span>
              <span><strong>Handed to staff:</strong> group and custom requests, callbacks, anything it can't confirm</span>
            </div>
          </div>

          <div className="spider-next-cta">
            <p className="fine-print">Sample business information, for illustration.</p>
            <a className="btn btn-white btn-sm" href="#channels" style={{ marginTop: '14px' }}>
              <span>See what you get</span>
              <span className="arr">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 03: FOUR CORE CHANNELS & SAFEGUARDS (PAGE 3)
          ========================================================================== */}
      <section className="cards-showcase-section" id="channels">
        <div className="container">
          <div className="cards-header text-center">
            <div className="eyebrow-pill">
              <span className="sparkle">✦</span>
              <span>What you get</span>
            </div>
            <h2 className="section-h2">A 24/7 front desk for seasonal businesses.</h2>
            <p className="cards-lede">
              Built for the four headaches of peak season: the morning phone rush, enquiries that arrive after you close, the same questions all day, and staff getting pulled off the floor.
            </p>
          </div>

          <div className="showcase-cards-grid">
            {/* Card 1: Incoming Voice Call */}
            <div className="showcase-card card-call" onClick={playVoiceCall}>
              <div className="card-top-row">
                <span className="card-chip chip-phone">📞 Phone assistant</span>
                <span className="sample-tag">Sample call</span>
              </div>
              <div className="card-dialogue-box">
                <div className="dialogue-q">"Are you open on stat holidays and what are your rental rates?"</div>
                <div className="dialogue-a">
                  <span className="bot-badge">Voice Bot</span>
                  <span>"Yes, we're open 8 am to 6 pm on the holiday. Day rentals start at $52, and you can reserve online ahead of time."</span>
                </div>
              </div>
              <div className="card-footer-meta">
                <div className="meta-item">
                  <span className="meta-label">Answers from</span>
                  <span className="meta-val">Your approved info</span>
                </div>
                <button className="btn btn-poppy btn-sm card-act-btn" type="button" onClick={(e) => { e.stopPropagation(); playVoiceCall(); }}>
                  <span>🔊 Hear a sample</span>
                </button>
              </div>
            </div>

            {/* Card 2: Website Live Chat */}
            <div className="showcase-card card-chat" onClick={openChat}>
              <div className="card-top-row">
                <span className="card-chip chip-chat">💬 Website chat</span>
                <span className="sample-tag">Sample chat</span>
              </div>
              <div className="card-dialogue-box">
                <div className="dialogue-q">"Can I book a guided morning tour for a group of 6 tomorrow?"</div>
                <div className="dialogue-a">
                  <span className="bot-badge">Web Bot</span>
                  <span>"Our morning tour leaves at 9 am. Here's the booking page to check spots and sign the waiver."</span>
                </div>
              </div>
              <div className="card-footer-meta">
                <div className="meta-item">
                  <span className="meta-label">Next step</span>
                  <span className="meta-val">Links to your booking page</span>
                </div>
                <button className="btn btn-white btn-sm card-act-btn" type="button" onClick={(e) => { e.stopPropagation(); openChat(); }}>
                  <span>💬 Try the chat</span>
                </button>
              </div>
            </div>

            {/* Card 3: Saturday Rush Stats */}
            <div className="showcase-card card-rush">
              <div className="card-top-row">
                <span className="card-chip chip-rush">⚡ The morning rush</span>
              </div>
              <div className="card-stat-hero">
                <span className="stat-number">24/7</span>
                <span className="stat-unit">including the 9 am rush</span>
              </div>
              <div className="card-stat-desc">
                When fifteen people call at once while your staff are fitting gear or serving guests, callers aren't left on hold or sent to voicemail. The assistant takes several calls at the same time.
              </div>
              <div className="card-footer-meta">
                <div className="meta-item">
                  <span className="meta-label">Busy signal</span>
                  <span className="meta-val">Calls answered in parallel</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Hours</span>
                  <span className="meta-val">Days, nights, holidays</span>
                </div>
              </div>
            </div>

            {/* Card 4: Staff Escalation Safeguard */}
            <div
              className="showcase-card card-safe"
              onClick={() => document.getElementById('safeguards')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="card-top-row">
                <span className="card-chip chip-safe">🛡️ Hand-off to staff</span>
              </div>
              <div className="card-dialogue-box safe-box">
                <div className="dialogue-q">"Custom corporate package for 25 guests with catering"</div>
                <div className="dialogue-escalate">
                  <div className="escalate-header">
                    <span className="safe-dot"></span>
                    <strong>Hand-off to a person</strong>
                  </div>
                  <p>Spots custom or sensitive requests, takes the details, and texts them to your manager instead of guessing.</p>
                </div>
              </div>
              <div className="card-footer-meta">
                <div className="meta-item">
                  <span className="meta-label">Goes to</span>
                  <span className="meta-val">Text, email or a call transfer</span>
                </div>
                <button
                  className="btn btn-white btn-sm card-act-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('safeguards')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>See safeguards →</span>
                </button>
              </div>
            </div>
          </div>

          <div className="cards-to-video-cta text-center">
            <button className="btn btn-dark" type="button" onClick={scrollToVideoAndPlay}>
              <span>▶ Watch the walkthrough</span>
              <span className="arr">↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          PRODUCT WALKTHROUGH VIDEO SHOWCASE SECTION
          ========================================================================== */}
      <section className="video-showcase-section" id="video">
        <div className="container">
          <div className="video-header-area">
            <div className="eyebrow-pill">
              <span className="sparkle">✦</span>
              <span>Walkthrough · under 30 seconds</span>
            </div>
            <h2 className="section-h2">See Alpine Wave handle a peak-day rush.</h2>
            <p className="section-lede">
              A short walkthrough of the assistant answering questions and handing off to staff when it should.
            </p>
          </div>

          <div className="cinema-frame">
            <div className="video-viewport" id="video-container">
              <video
                ref={videoRef}
                id="main-demo-video"
                playsInline
                preload="metadata"
                loop
                muted={videoMuted}
                onClick={toggleMainVideo}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={() => setVideoPlaying(false)}
              >
                <source src="/alpine-wave-walkthrough.mp4" type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>

              <div className="video-hud-top">
                <div className="hud-chip">
                  <span className="live-dot"></span>
                  <span id="video-hud-label">Sample demo · made-up business</span>
                </div>
              </div>

              {!videoPlaying && (
                <div className="video-play-overlay" id="video-overlay" onClick={toggleMainVideo}>
                  <div className="play-circle">▶</div>
                  <div className="play-overlay-title">Watch the walkthrough</div>
                  <div className="play-overlay-sub">Plays with sound</div>
                </div>
              )}

              <div className="video-control-bar">
                <button
                  className="v-ctrl-btn"
                  id="ctrl-play-btn"
                  onClick={toggleMainVideo}
                  title="Play/Pause"
                  aria-label="Play or pause"
                  type="button"
                >
                  {videoPlaying ? '⏸' : '▶'}
                </button>
                <div className="v-scrubber-track" onClick={seekVideo} role="progressbar" aria-valuenow={videoProgress}>
                  <div className="v-scrubber-fill" id="video-progress" style={{ width: `${videoProgress}%` }}></div>
                </div>
                <div className="v-time-display" id="video-time">{videoTimeDisplay}</div>
                <button
                  className="v-ctrl-btn"
                  id="ctrl-mute-btn"
                  onClick={toggleVideoMute}
                  title="Mute/Unmute"
                  aria-label="Mute or unmute"
                  type="button"
                >
                  {videoMuted ? '🔇' : '🔊'}
                </button>
                <button
                  className="v-ctrl-btn"
                  onClick={toggleVideoFullscreen}
                  title="Fullscreen"
                  aria-label="Fullscreen"
                  type="button"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          CHAPTER 01: VIBRANT POPPY EDITORIAL BLOCK
          ========================================================================== */}
      <section className="chapter-poppy" id="one-brain">
        <div className="container">
          <div className="chapter-grid">
            <div>
              <span className="chapter-num">01.</span>
              <span className="chapter-tag">Chapter 01 / One brain</span>
              <h2 className="section-h2">Two channels. One set of answers.</h2>
              <p className="chapter-copy">
                Whether a guest calls from the car on Highway 97 or chats from their condo at 11 pm, they get the same answer, built only from the facts, rates and policies you've approved.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-white btn-sm" type="button" onClick={playVoiceCall}>
                  ▶ Hear a sample call
                </button>
                <button className="btn btn-dark btn-sm" type="button" onClick={openChat}>
                  Try the website chat →
                </button>
              </div>
            </div>

            {/* Simulator Box */}
            <div className="simulator-box">
              <div className="sim-header">
                <div className="sim-caller-info">
                  <div className="sim-avatar">🏔️</div>
                  <div>
                    <div className="sim-name">Phone assistant</div>
                    <div className="sim-sub">Sample call · made-up business</div>
                  </div>
                </div>
                <span className="sample-tag" style={{ color: 'var(--ink-muted)', borderColor: 'var(--line-strong)' }}>Sample</span>
              </div>

              {/* Dynamic Audio Waveform */}
              <div className="waveform-strip" id="waveform">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className={`wave-bar${speechActive ? ' active' : ''}`}></div>
                ))}
              </div>

              {/* Transcript */}
              <div className="dialogue-thread" id="call-dialogue">
                <div className="d-bubble d-guest">
                  <span className="d-tag">Caller</span>
                  "Hi! If the temperature drops below minus 20, do the guided snowmobile tours still run?"
                </div>
                <div className="d-bubble d-bot">
                  <span className="d-tag">Assistant</span>
                  "Yes, tours run down to minus 25, and we supply heated grips and full winter suits. If weather closes the trail, you can reschedule for free or get a full refund."
                </div>
              </div>

              <button className="call-btn-trigger" id="audio-toggle-btn" type="button" onClick={playVoiceCall}>
                <span>{speechActive ? '⏹ Stop sample' : '🔊 Play sample call'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          CHAPTER 02: WARM VANILLA / SAND - COMMON ASKS
          ========================================================================== */}
      <section className="chapter-sand" id="questions">
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span className="chapter-num">02.</span>
            <span className="chapter-label">Chapter 02 / The questions you hear all day</span>
            <h2 className="section-h2">Handles the questions your staff answer a hundred times a day.</h2>
            <p className="section-lede">
              Most peak-season calls ask the same things: pickup times, what's included, waivers, weather. Alpine Wave answers them from your information, so your crew can look after the guests in front of them. Good questions. Verified answers.
            </p>
            <p style={{ marginTop: '14px' }}><span className="sample-tag">Sample answers · made-up businesses</span></p>
          </div>

          <div className="questions-filter-pills">
            <button
              className={`q-pill${activeCategory === 'all' ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveCategory('all')}
            >
              All Questions <span className="pill-count">6</span>
            </button>
            <button
              className={`q-pill${activeCategory === 'gear' ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveCategory('gear')}
            >
              Gear &amp; Sizing <span className="pill-count">2</span>
            </button>
            <button
              className={`q-pill${activeCategory === 'weather' ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveCategory('weather')}
            >
              Weather &amp; Snow <span className="pill-count">2</span>
            </button>
            <button
              className={`q-pill${activeCategory === 'booking' ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveCategory('booking')}
            >
              Bookings &amp; Waivers <span className="pill-count">2</span>
            </button>
          </div>

          <div className="q-cards-grid" id="q-grid">
            {filteredQuestions.map((q, i) => (
              <div key={i} className="q-card" data-cat={q.cat}>
                <span className="q-card-badge">{q.badge}</span>
                <div className="q-card-query">{q.query}</div>
                <div className="q-card-answer">{q.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          CHAPTER 03: DEEP MIDNIGHT INK - OPERATOR SAFEGUARDS
          ========================================================================== */}
      <section className="chapter-midnight" id="safeguards">
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <span className="chapter-num">03.</span>
            <span className="chapter-label">Chapter 03 / Peace of mind</span>
            <h2 className="section-h2">Answers from your facts. Doesn't guess.</h2>
            <p className="section-lede" style={{ color: 'rgba(255, 255, 255, 0.78)' }}>
              You can't have a bot making up prices, getting availability wrong or guessing at safety rules. Alpine Wave answers only from the business information you've approved.
            </p>
          </div>

          <div className="safeguards-cards">
            <div className="safe-card">
              <div className="safe-icon">🔒</div>
              <div className="safe-title">Only your approved info</div>
              <div className="safe-body">
                It answers only from your approved guide, rates and policies. If the answer isn't there, it says so and offers to pass the question on.
              </div>
            </div>

            <div className="safe-card">
              <div className="safe-icon">📱</div>
              <div className="safe-title">Hand-off to a person</div>
              <div className="safe-body">
                Large group bookings, medical questions, custom quotes: it takes the details and texts your desk, or transfers the call where your phone setup allows.
              </div>
            </div>

            <div className="safe-card">
              <div className="safe-icon">🚨</div>
              <div className="safe-title">One-switch updates</div>
              <div className="safe-body">
                Trail closed? Road washed out? Change the notice once and both the phone and the website chat pass it on.
              </div>
            </div>

            <div className="safe-card">
              <div className="safe-icon">🇨🇦</div>
              <div className="safe-title">Local BC numbers</div>
              <div className="safe-body">
                A local area code (236, 250 or 604) so callers see a number they recognise, or forward your existing line.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          FEATURE GRID: WHAT'S UNDER THE HOOD
          ========================================================================== */}
      <section className="features-deep-section" id="features">
        <div className="container">
          <div style={{ maxWidth: '820px', marginBottom: '48px' }}>
            <div className="eyebrow-pill"><span className="sparkle">✦</span><span>What's under the hood</span></div>
            <h2 className="section-h2">Built for how local businesses actually run.</h2>
            <p className="section-lede">
              It isn't a generic chatbot or an answering machine. It's set up around your information, your booking page and your staff.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">🔗</div>
              <h3>Website and phone, one setup</h3>
              <p>One set of approved answers powers both the chat on your website and the phone line. Update it once and both stay in step.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">📅</div>
              <h3>Booking hand-off</h3>
              <p>Sends callers and website visitors straight to your existing booking page, so a ready-to-book guest doesn't drift away.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">🗣️</div>
              <h3>Natural phone conversations</h3>
              <p>Callers just talk. No press-1 menus, no voicemail maze, and replies quick enough to feel like a conversation.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">📱</div>
              <h3>Staff alerts by text and email</h3>
              <p>Leads, callback requests and after-hours enquiries arrive on your manager's phone as a short summary with the full transcript.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">🔄</div>
              <h3>Warm call transfer</h3>
              <p>When a caller needs a person, the assistant can put them through to your counter phone and give your staff a quick briefing first.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">🌙</div>
              <h3>After-hours capture</h3>
              <p>Enquiries at 11 pm still get an answer, and anything that needs you is waiting in the morning with the caller's details.</p>
            </div>
          </div>
          <p className="fine-print">Call transfer and system connections depend on your phone and booking setup; we check before we quote.</p>
        </div>
      </section>

      {/* ==========================================================================
          PLANS: THE 3-TIER PATH
          ========================================================================== */}
      <section className="tier-progression-section" id="tier1" style={{ padding: '100px 0 40px' }}>
        <div className="container">
          <div style={{ maxWidth: '860px', marginBottom: '40px' }}>
            <div className="eyebrow-pill"><span className="sparkle">✦</span><span>Start small · go deeper when you're ready</span></div>
            <h2 className="section-h2" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
              See it first. <br />
              <span className="accent-word">Trust it before you go further.</span>
            </h2>
            <p className="section-lede">
              We never ask for passwords or system access up front. First you see a demo built from your own website. Then a 7-day shadow trial shows you exactly what you're missing. You decide from there.
            </p>
          </div>

          <div className="tier-grid">
            <article className="tier-card featured">
              <div className="tier-head"><span className="tier-badge">Tier 1 · The way in</span><span className="tier-time">Free demo</span></div>
              <h3>A demo built from your own website</h3>
              <p><strong>Nothing to set up.</strong> We read your public website and build a demo assistant from what you've already published. You get a private link to try it.</p>
              <ul>
                <li>Answers questions using your own published info</li>
                <li>No passwords, logins or system access</li>
                <li>Try it yourself and show your staff</li>
                <li>Nothing goes on your site unless you say so</li>
              </ul>
              <button className="btn btn-poppy btn-sm" type="button" onClick={openChat}>Ask for a demo <span className="arr">→</span></button>
            </article>

            <article className="tier-card">
              <div className="tier-head"><span className="tier-badge">Tier 2 · Prove it</span><span className="tier-time">7-day trial</span></div>
              <h3>7-day shadow trial &amp; report</h3>
              <p><strong>Your staff still answer first.</strong> If nobody picks up, day or night, the assistant does. Every call and chat is recorded so the report shows the full picture.</p>
              <ul>
                <li>Missed and after-hours calls answered by the assistant</li>
                <li>Staff calls recorded too, with a one-tap stop for private moments</li>
                <li>Website chats and visitor clicks logged</li>
                <li>Callers hear a short recording notice</li>
                <li>Day-7 report: what came in, what was missed, what it would have caught</li>
              </ul>
              <button className="btn btn-white btn-sm" type="button" onClick={openChat}>Ask about the trial <span className="arr">→</span></button>
            </article>

            <article className="tier-card">
              <div className="tier-head"><span className="tier-badge">Tier 3 · Full partner</span><span className="tier-time">When you're ready</span></div>
              <h3>Connected to how you work</h3>
              <p><strong>Once you trust it.</strong> We connect the assistant to your stock, bookings and email so it can do more than answer questions.</p>
              <ul>
                <li>Live stock and availability checks</li>
                <li>Bookings straight into your calendar or booking tool</li>
                <li>Email enquiries answered or sorted for your team</li>
                <li>Full-time cover, with warm transfers to your front desk</li>
              </ul>
              <button className="btn btn-white btn-sm" type="button" onClick={openChat}>Ask about going further <span className="arr">→</span></button>
            </article>
          </div>

          <div className="tier-note">
            <span>⚡ Every business starts at Tier 1. Tier 3 connections are checked against your systems before we quote.</span>
            <a href="tel:+12362057030">📞 (236) 205-7030</a>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          FINAL READY SECTION
          ========================================================================== */}
      <section className="ready-band">
        <div className="container">
          <div className="ready-box">
            <span className="eyebrow-pill"><span className="sparkle">✦</span><span>Next step</span></span>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', margin: '18px 0', lineHeight: 1 }}>
              Ready to stop missing calls <br />
              <span className="accent-word">this season?</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', maxWidth: '620px', margin: '0 auto 36px' }}>
              Send us your website. We'll build a free demo assistant from it and send you a private link to try.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-poppy" type="button" onClick={openChat}>
                Chat with Alpine Wave <span className="arr">→</span>
              </button>
              <a href="tel:+12362057030" className="btn btn-white">
                📞 (236) 205-7030
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="container-wide">
          <div className="footer-top">
            <div className="footer-brand">
              <svg viewBox="0 0 36 24" width="36" height="24" aria-hidden="true">
                <path d="M1 20 L12 5 L18 13 L22 8 L35 20" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M1 20 q4.25 -4 8.5 0 t8.5 0 t8.5 0 t8.5 0" fill="none" stroke="var(--vibrant-poppy)" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
              <span>Alpine Wave</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>How it works</a>
              <a href="#tier1" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Plans</a>
              <a href="#safeguards" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Safeguards</a>
              <a href="mailto:info@alpinewave.ca" style={{ color: 'var(--vibrant-poppy)', textDecoration: 'none', fontWeight: 700 }}>info@alpinewave.ca</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 Alpine Wave Studio · Okanagan, British Columbia</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
              Sample conversations on this page use made-up business information.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Launcher Pill */}
      <button className="chat-launcher-btn" type="button" onClick={openChat} aria-label="Open Interactive Chat Assistant">
        <span>💬 Ask Alpine Wave AI</span>
      </button>

      {/* Chat Drawer connected directly to /api/chat */}
      <Chat ref={chatRef} isOpen={chatOpen} onClose={closeChat} />
    </>
  );
}
