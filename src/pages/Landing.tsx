import { Link } from 'react-router-dom';
import { IMG } from '../data/images';
import { Button, Reveal } from '../components/ui';
import { MapCanvas } from '../components/MapCanvas';
import { Donut } from '../components/charts';
import { ArrowRightIcon, LogoMark, QuoteIcon, SparkIcon } from '../components/icons';

/* ---------------- mini product mocks ---------------- */

function MiniItinerary() {
  const rows = [
    { t: '09:00', label: 'Sant\u2019Eustachio espresso', c: '#8F6A45' },
    { t: '10:30', label: 'Colosseum — skip the line', c: '#E8A33D' },
    { t: '13:30', label: 'Lunch in Trastevere', c: '#E4572E' },
    { t: '15:30', label: 'Roman Forum at golden hour', c: '#E8A33D' },
  ];
  return (
    <div className="rounded-xl border border-line bg-bone p-4 shadow-lift">
      <p className="mb-3 font-mono text-[9.5px] font-bold tracking-[0.2em] text-fog">MON · MAY 12 — ROME</p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.t} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-mist/60">
            <span className="tnum font-mono text-[11px] font-bold text-persimmon">{r.t}</span>
            <span className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: r.c }} />
            <span className="truncate text-[13px] font-semibold text-ink">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniMap() {
  return (
    <div className="h-[300px] overflow-hidden rounded-xl border border-line shadow-lift sm:h-[340px]">
      <MapCanvas
        city="rome"
        markers={[
          { id: 'a', lat: 41.9065, lng: 12.4536, label: 'Vatican', color: '#2E6B60', kind: 'stop', index: 1 },
          { id: 'b', lat: 41.8986, lng: 12.4769, label: 'Pantheon', color: '#E8A33D', kind: 'stop', index: 2 },
          { id: 'c', lat: 41.9009, lng: 12.4833, label: 'Trevi', color: '#E4572E', kind: 'stop', index: 3 },
          { id: 'd', lat: 41.8902, lng: 12.4922, label: 'Colosseum', color: '#7E5A78', kind: 'stop', index: 4 },
        ]}
        selectedId="b"
        route={[
          { lat: 41.9065, lng: 12.4536 },
          { lat: 41.8986, lng: 12.4769 },
          { lat: 41.9009, lng: 12.4833 },
          { lat: 41.8902, lng: 12.4922 },
        ]}
      />
    </div>
  );
}

function MiniRoute() {
  const before = ['Vatican', 'Colosseum', 'Trevi', 'Pantheon'];
  const after = ['Vatican', 'Pantheon', 'Trevi', 'Colosseum'];
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-line bg-bone p-4 shadow-card">
        <p className="mb-2.5 font-mono text-[9.5px] font-bold tracking-[0.2em] text-fog">BEFORE · 9.8 KM</p>
        <ul className="space-y-2">
          {before.map((p, i) => (
            <li key={p} className="flex items-center gap-2 text-[13px] font-semibold text-moss">
              <span className="tnum font-mono text-[10.5px] text-fog">{i + 1}</span>
              <span className="h-px flex-1 bg-line" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative rounded-xl border-2 border-persimmon/40 bg-bone p-4 shadow-lift">
        <span className="absolute -top-2.5 right-3 rounded bg-persimmon px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-bone">−38 MIN WALK</span>
        <p className="mb-2.5 font-mono text-[9.5px] font-bold tracking-[0.2em] text-persimmon">AFTER · 6.1 KM</p>
        <ul className="space-y-2">
          {after.map((p, i) => (
            <li key={p} className="flex items-center gap-2 text-[13px] font-bold text-ink">
              <span className="tnum font-mono text-[10.5px] text-persimmon">{i + 1}</span>
              <span className="h-px flex-1 bg-persimmon/30" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MiniBudget() {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-line bg-bone p-4 shadow-lift">
      <Donut
        size={120}
        thickness={15}
        centerTop="€821"
        centerBottom="of €1,500"
        data={[
          { label: 'Stays', value: 530, color: '#2E6B60' },
          { label: 'Food', value: 83, color: '#E4572E' },
          { label: 'Transport', value: 115, color: '#E8A33D' },
          { label: 'Activities', value: 163, color: '#7E5A78' },
        ]}
      />
      <ul className="space-y-1.5">
        {[
          ['Stays', '€530', '#2E6B60'],
          ['Activities', '€163', '#7E5A78'],
          ['Transport', '€115', '#E8A33D'],
          ['Food', '€83', '#E4572E'],
        ].map(([l, v, c]) => (
          <li key={l} className="flex items-center gap-2 text-[12.5px] font-semibold text-moss">
            <span className="h-2 w-2 rounded-[3px]" style={{ background: c }} />
            {l}
            <span className="tnum ml-auto pl-4 font-mono text-[11px] font-bold text-ink">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniPostcard() {
  return (
    <div className="relative w-full max-w-[340px] rotate-[-2.5deg] rounded-lg border border-line bg-bone p-2.5 pb-4 shadow-lift transition-transform duration-500 hover:rotate-0">
      <span className="absolute -top-2.5 left-8 h-5 w-16 rotate-[-4deg] bg-saffron/60 backdrop-blur-[1px]" />
      <span className="absolute -top-2 right-10 h-5 w-12 rotate-[5deg] bg-teal/40" />
      <img src={IMG.florence} alt="Florence at sunset" className="h-40 w-full rounded-md object-cover" />
      <p className="mt-2.5 px-1 font-display text-[15px] font-semibold italic text-ink">Florence turned to gold at 20:14.</p>
      <p className="px-1 font-mono text-[9.5px] font-bold tracking-[0.18em] text-fog">MAY 17 · PIAZZALE MICHELANGELO</p>
    </div>
  );
}

/* ---------------- page ---------------- */

const CHAPTERS = [
  {
    n: '01',
    title: 'Plan',
    sub: 'Your whole trip on one canvas',
    copy: 'Days down the left, moments down the page. Drag a dinner between Tuesdays, drop the Vatican on day two, and watch every count, cost and map pin update itself.',
    visual: <MiniItinerary />,
  },
  {
    n: '02',
    title: 'Explore',
    sub: 'Discover places worth the detour',
    copy: 'A curated field guide for every city — attractions, trattorias, markets, viewpoints. Save what calls to you and it lands straight on your map.',
    visual: <MiniMap />,
  },
  {
    n: '03',
    title: 'Route',
    sub: 'Build my day, minus the zigzag',
    copy: 'Pick the places, set your hours, and TripCanvas reorders the day into a walkable line — nearest-neighbour logic, 2-opt polish, and the minutes you saved.',
    visual: <MiniRoute />,
  },
  {
    n: '04',
    title: 'Budget',
    sub: 'Know where every euro walks to',
    copy: 'Stays, plates, trains, tickets — logged in two taps and charted live against the number you set before you packed.',
    visual: <MiniBudget />,
  },
  {
    n: '05',
    title: 'Remember',
    sub: 'The trip becomes a keepsake',
    copy: 'When the suitcase is unpacked, pin photos, dates and one-line truths into an editorial journal you\u2019ll actually reread.',
    visual: <MiniPostcard />,
  },
];

export default function Landing() {
  return (
    <div className="bg-chalk">
      {/* ---------- hero ---------- */}
      <header className="relative overflow-hidden bg-deep text-chalk">
        <div className="dark-grain absolute inset-0" />
        <svg className="absolute -right-24 top-0 h-full w-[880px] opacity-[0.16]" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path
              key={i}
              d={`M-40 ${120 + i * 95} Q 200 ${60 + i * 95}, 420 ${130 + i * 95} T 860 ${110 + i * 95}`}
              fill="none"
              stroke="#7A9683"
              strokeWidth="1.1"
            />
          ))}
        </svg>

        <nav className="relative z-10 mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-display text-[20px] font-bold tracking-tight">TripCanvas</span>
          </Link>
          <div className="hidden items-center gap-7 font-mono text-[11px] font-bold tracking-[0.18em] text-fern md:flex">
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-chalk">THE METHOD</button>
            <button onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-chalk">FIELD NOTES</button>
          </div>
          <Link to="/trips">
            <Button size="sm">Open my trips <ArrowRightIcon size={14} /></Button>
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="rise-in flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-saffron">
              <span className="h-px w-8 bg-saffron" /> ITINERARY · MAP · BUDGET · JOURNAL
            </p>
            <h1 className="rise-in mt-5 font-display text-[44px] font-semibold leading-[1.02] tracking-tight sm:text-[62px] lg:text-[70px]" style={{ animationDelay: '80ms' }}>
              Your trip.
              <br />
              <em className="text-persimmon">Beautifully</em> planned.
            </h1>
            <p className="rise-in mt-6 max-w-[46ch] text-[16px] leading-relaxed text-fern sm:text-[17.5px]" style={{ animationDelay: '160ms' }}>
              TripCanvas lays your whole journey on a single canvas — the day-by-day plan, a live map of everywhere you're going, a budget that keeps score, and a journal for when it's over.
            </p>
            <div className="rise-in mt-9 flex flex-wrap items-center gap-3.5" style={{ animationDelay: '240ms' }}>
              <Link to="/trips">
                <Button size="lg">Start planning <ArrowRightIcon size={16} /></Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="border border-fern/30 text-chalk hover:bg-chalk/10 hover:text-chalk"
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </Button>
            </div>
            <p className="rise-in mt-8 font-mono text-[10.5px] font-bold tracking-[0.2em] text-fern/80" style={{ animationDelay: '320ms' }}>
              NO ACCOUNT · DEMO TRIPS INSIDE · 41.90°N 12.49°E
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative ml-auto max-w-[560px]">
              {/* ticket frame */}
              <div className="relative overflow-hidden rounded-xl border border-chalk/15 bg-pine shadow-lift">
                <div className="flex items-center justify-between border-b border-dashed border-chalk/25 px-4 py-2.5">
                  <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-saffron">BOARDING · ITINERARY №001</span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-fern">ROM → VCE</span>
                </div>
                <div className="relative h-[300px] overflow-hidden sm:h-[360px]">
                  <img src={IMG.hero} alt="Cinque Terre coastline at golden hour" className="kb h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" />
                  {/* floating route card */}
                  <div className="floaty absolute bottom-4 left-4 right-4 rounded-lg border border-chalk/20 bg-deep/80 p-3.5 backdrop-blur-md sm:right-auto sm:w-[300px]">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[9.5px] font-bold tracking-[0.2em] text-saffron">DAY 01 · ROME</p>
                      <span className="flex items-center gap-1 font-mono text-[9.5px] font-bold tracking-wider text-fern"><SparkIcon size={11} /> 6 STOPS</span>
                    </div>
                    <div className="mt-2.5 space-y-1.5">
                      {[['09:00', 'Espresso at Sant\u2019Eustachio'], ['10:30', 'Colosseum, arena floor'], ['18:30', 'Sunset — Pincio terrace']].map(([t, l]) => (
                        <div key={t} className="flex items-center gap-2.5">
                          <span className="tnum font-mono text-[10.5px] font-bold text-persimmon">{t}</span>
                          <span className="h-px w-3 bg-chalk/25" />
                          <span className="truncate text-[12px] font-semibold text-chalk">{l}</span>
                        </div>
                      ))}
                    </div>
                    <svg viewBox="0 0 260 8" className="mt-3 w-full" aria-hidden="true">
                      <path d="M2 4 H258" stroke="#E4572E" strokeWidth="2" strokeDasharray="5 5" className="route-ants" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-fern">MAY 12 — MAY 21 · 10 DAYS · 3 CITIES</span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-saffron">€1,500</span>
                </div>
              </div>
              {/* notch dots */}
              <span className="absolute -left-2 top-[46px] h-4 w-4 rounded-full bg-deep" />
              <span className="absolute -right-2 top-[46px] h-4 w-4 rounded-full bg-deep" />
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="relative z-10 border-t border-chalk/12 bg-pine py-3.5">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-8" aria-hidden={dup === 1}>
                  {['ROME 41.90°N', 'FLORENCE 43.77°N', 'VENICE 45.44°N', 'PARIS 48.86°N', 'TOKYO 35.68°N', 'KYOTO 35.01°N', 'OSAKA 34.69°N', 'LISBON 38.72°N'].map((c) => (
                    <span key={`${dup}-${c}`} className="flex items-center gap-8 font-mono text-[11px] font-bold tracking-[0.24em] text-fern">
                      {c} <span className="text-persimmon">✳</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- chapters ---------- */}
      <section id="how" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:py-28">
        <Reveal>
          <div className="max-w-[640px]">
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
              <span className="h-px w-8 bg-persimmon" /> THE METHOD
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.06] tracking-tight text-ink sm:text-[46px]">
              One canvas for the <em className="text-persimmon">whole</em> journey.
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-moss">
              Five movements, from the first daydream to the last souvenir. Everything lives in the same workspace, so nothing gets lost between apps, screenshots and group chats.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {CHAPTERS.map((ch, i) => (
            <Reveal key={ch.n}>
              <div className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-14 ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
                <div className="lg:col-span-5 lg:[direction:ltr]">
                  <p className="font-display text-[64px] font-semibold italic leading-none text-line select-none">{ch.n}</p>
                  <h3 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-ink">{ch.title}</h3>
                  <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-persimmon">{ch.sub}</p>
                  <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-moss">{ch.copy}</p>
                  <Link to="/trips" className="group mt-6 inline-flex items-center gap-2 text-[13.5px] font-bold text-pine transition-colors hover:text-persimmon">
                    Try it in the workspace
                    <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="lg:col-span-7 lg:[direction:ltr]">
                  <div className="paper-grain rounded-2xl border border-line bg-chalk p-4 sm:p-6">{ch.visual}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- quote ---------- */}
      <section id="quote" className="relative overflow-hidden bg-pine py-20 text-chalk">
        <div className="dark-grain absolute inset-0" />
        <Reveal className="relative z-10 mx-auto max-w-[820px] px-4 text-center sm:px-6">
          <QuoteIcon size={44} className="mx-auto text-persimmon" />
          <blockquote className="mt-6 font-display text-[26px] font-medium italic leading-snug sm:text-[34px]">
            "We planned ten days of Italy in one evening — and the map knew our route better than we did by day three."
          </blockquote>
          <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.22em] text-fern">ELENA &amp; MARCO · TRIP №001 · ROME — VENICE</p>
        </Reveal>
      </section>

      {/* ---------- closing CTA ---------- */}
      <section className="paper-grain mx-auto max-w-[1240px] px-4 py-20 text-center sm:px-6 lg:py-28">
        <Reveal>
          <p className="font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">FINAL CALL</p>
          <h2 className="mx-auto mt-4 max-w-[18ch] font-display text-[38px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[54px]">
            The world is waiting. Plan it <em className="text-persimmon">beautifully</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-moss">
            Three demo trips are packed and ready — open Italy and start dragging your first day around.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link to="/trips">
              <Button size="lg">Open the canvas <ArrowRightIcon size={16} /></Button>
            </Link>
            <Link to="/trip/trip-italy/itinerary">
              <Button size="lg" variant="outline">Peek at the Italy itinerary</Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line bg-mist/40">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-display text-[15px] font-bold text-ink">TripCanvas</span>
          </span>
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-fog">PLAN THE JOURNEY · KEEP THE MEMORY · © 2025</p>
        </div>
      </footer>
    </div>
  );
}
