'use client';

import { useEffect, useRef } from 'react';
import { Phone, isStill } from './Phone';

// Eight everyday questions around one phone (4 per side). Made-up shop, labelled under the phone.
const LEFT = [
  { who: 'A weekend visitor', q: 'Are you open Sunday?', a: 'We are, 9 till 5 on Sundays this winter.' },
  { who: 'A parent, Friday night', q: "Do you rent kids' skis?", a: "Yes, kids' ski and boot packages from age 4. Bring their shoe size and we'll fit them in the shop." },
  { who: 'A local skier', q: 'How long for a tune?', a: "Usually next day if it's in before noon. For today's availability, try the shop on 250-555-0100, open 9 till 5." },
  { who: 'First chair skier', q: 'Can I pick up gear the night before?', a: "Yes, pick up after 4 pm the day before at no extra charge so you're ready for first chair." },
];
const RIGHT = [
  { who: 'A snowboarder', q: 'Do you rent snowboards?', a: 'Yes, board and boot packages for adults and kids. Come in and the team will fit you.' },
  { who: 'Visiting family', q: 'Do I need to book in advance?', a: 'Walk-ins are welcome, but booking online guarantees your sizes on busy weekends.' },
  { who: 'A tour guest', q: 'What do we bring on the snowshoe tour?', a: 'Warm layers, gloves and water. Snowshoes and poles are included.' },
  { who: 'First time in town', q: 'Where do I park?', a: "There's free parking behind the shop, off the side street." },
];
const ALL = [...LEFT, ...RIGHT];
const SVG_NS = 'http://www.w3.org/2000/svg';

const Card = ({ item }) => (
  <button type="button" className="ask-card"><span className="who">{item.who}</span><span className="q">"{item.q}"</span></button>
);

// A line from each question into the phone. The phone answers one question at a time;
// it moves on by itself, or the visitor clicks a question.
export default function SpiderPhone() {
  const ref = useRef(null);

  useEffect(() => {
    const spider = ref.current;
    const svg = spider.querySelector('.spider-lines');
    const phone = spider.querySelector('.aw-phone');
    const talk = spider.querySelector('[data-spider]');
    const cards = [...spider.querySelectorAll('.ask-card')];
    const still = isStill();
    let current = 0, timer = null, reply = null, run = 0;

    const paths = cards.map((_, i) => {
      const ray = svg.appendChild(document.createElementNS(SVG_NS, 'path'));
      ray.setAttribute('class', 'sp-ray');
      const shim = svg.appendChild(document.createElementNS(SVG_NS, 'path'));
      shim.setAttribute('class', 'sp-shim');
      shim.style.animationDelay = (-i * 0.4) + 's';
      return { ray, shim };
    });

    // A dot runs down the picked line into the phone (650 ms, ease in-out), then the phone answers.
    const travel = (path) => new Promise((done) => {
      if (still || !path.getTotalLength() || getComputedStyle(svg).display === 'none') return done();
      const dot = svg.appendChild(document.createElementNS(SVG_NS, 'circle'));
      dot.setAttribute('r', '6');
      dot.setAttribute('class', 'sp-dot');
      const L = path.getTotalLength();
      const t0 = performance.now();
      let finished = false;
      const finish = () => { if (finished) return; finished = true; dot.remove(); done(); };
      // Frames can be slowed (background tab), so a timer makes sure the phone still answers.
      setTimeout(finish, 700);
      const step = (now) => {
        if (finished) return;
        const k = Math.min((now - t0) / 650, 1);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const p = path.getPointAtLength(L * e);
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        if (k < 1) requestAnimationFrame(step); else finish();
      };
      requestAnimationFrame(step);
    });

    const draw = () => {
      const box = spider.getBoundingClientRect();
      const p = phone.getBoundingClientRect();
      cards.forEach((card, i) => {
        const c = card.getBoundingClientRect();
        const left = i < LEFT.length;
        const sideCards = left ? cards.slice(0, LEFT.length) : cards.slice(LEFT.length);
        const k = sideCards.indexOf(card);
        const total = sideCards.length;
        const sx = (left ? c.right : c.left) - box.left;
        const sy = c.top + c.height / 2 - box.top;
        const ex = (left ? p.left : p.right) - box.left;
        const step = total > 1 ? 0.48 / (total - 1) : 0;
        const ey = p.top + p.height * (0.24 + step * k) - box.top;
        const bend = (ex - sx) * 0.55;
        const d = `M${sx},${sy} C${sx + bend},${sy} ${ex - bend},${ey} ${ex},${ey}`;
        paths[i].ray.setAttribute('d', d);
        paths[i].shim.setAttribute('d', d);
      });
    };

    const bubble = (cls, text) => {
      const b = document.createElement('div');
      b.className = 'aw-bubble ' + cls;
      b.textContent = text;
      talk.appendChild(b);
      return b;
    };
    const show = async (i) => {
      const mine = ++run;
      current = i;
      cards.forEach((c, j) => c.classList.toggle('on', j === i));
      paths.forEach((p, j) => p.ray.classList.toggle('on', j === i));
      clearTimeout(reply);
      talk.replaceChildren();
      await travel(paths[i].ray);
      if (mine !== run) return;
      const q = bubble('caller', ALL[i].q);
      const a = bubble('aw', ALL[i].a);
      if (still) { q.classList.add('on'); a.classList.add('on'); return; }
      requestAnimationFrame(() => q.classList.add('on'));
      reply = setTimeout(() => a.classList.add('on'), 1100);
    };
    const cycle = () => {
      clearInterval(timer);
      if (!still) timer = setInterval(() => show((current + 1) % cards.length), 5200);
    };

    const clicks = cards.map((card, i) => {
      const onClick = () => { show(i); cycle(); };
      card.addEventListener('click', onClick);
      return onClick;
    });
    const resize = new ResizeObserver(draw);
    resize.observe(spider);
    draw();
    show(0);
    cycle();

    return () => {
      run++;
      clearInterval(timer);
      clearTimeout(reply);
      resize.disconnect();
      cards.forEach((card, i) => card.removeEventListener('click', clicks[i]));
      paths.forEach(({ ray, shim }) => { ray.remove(); shim.remove(); });
      talk.replaceChildren();
    };
  }, []);

  return (
    <div className="spider" ref={ref}>
      <svg className="spider-lines" aria-hidden="true">
        <defs>
          <linearGradient id="awShimGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE5D9" />
            <stop offset="0.5" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FD632F" />
          </linearGradient>
          <filter id="awShimGlow" x="-0.5" y="-0.5" width="2" height="2">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="spider-col left">{LEFT.map(item => <Card key={item.q} item={item} />)}</div>
      <Phone status>
        <div className="aw-talk" data-spider="" />
      </Phone>
      <div className="spider-col right">{RIGHT.map(item => <Card key={item.q} item={item} />)}</div>
    </div>
  );
}
