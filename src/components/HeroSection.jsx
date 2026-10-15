import { motion } from 'framer-motion';
import { siteMeta } from '../data/portfolioData';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export default function HeroSection() {
  // Ticker setup — duplicate for seamless loop
  const tickerContent = [...siteMeta.tickerItems, ...siteMeta.tickerItems];

  return (
    <section
      className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-between"
      style={{ paddingTop: '80px' }}
    >
      {/* ── Hero text ───────────────────────────────────────── */}
      <div className="relative z-10 px-5 sm:px-8 md:pl-10 md:pr-6 lg:pl-12 lg:pr-8 max-w-7xl w-full mr-auto my-auto pt-12 sm:pt-16 md:pt-20 pb-6">
        <motion.div 
          variants={STAGGER} 
          initial="hidden" 
          animate="show"
          className="mt-1 sm:mt-2 md:mt-4"
        >

          {/* Section tag */}
          <motion.p variants={FADE_UP} className="section-label mb-6 flex items-center gap-3">
            <span className="block w-8 h-px bg-border" />
            Visual Craft Portfolio — 2024–2026
          </motion.p>

          {/* Main display heading */}
          <motion.h1
            variants={FADE_UP}
            className="font-display font-extrabold leading-none text-text mb-4"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(3.2rem, 9vw, 8rem)',
              letterSpacing: '-0.04em',
              lineHeight: '0.92',
            }}
          >
            EDITING
            <br />
            <span
              className="hero-portfolio-stroke"
              style={{
                WebkitTextStroke: '1px rgba(226,249,82,0.6)',
                color: 'transparent',
              }}
            >
              PORTFOLIO
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={FADE_UP}
            className="font-mono text-text-dim mt-6 max-w-lg"
            style={{ fontSize: '0.8125rem', lineHeight: '1.7', letterSpacing: '0.04em' }}
          >
            {siteMeta.editor} — {siteMeta.tagline}
            <br />
            Cinematic cuts · Colour science · Visual retouching
          </motion.p>

          {/* CTA row */}
          <motion.div variants={FADE_UP} className="flex items-center gap-4 mt-9">
            <a
              href="#work"
              className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-all duration-200"
              style={{
                background: '#E2F952',
                color: '#08080A',
                letterSpacing: '0.14em',
                fontWeight: 600,
              }}
            >
              <span>VIEW WORK</span>
              <span className="opacity-60">↗</span>
            </a>
            <a
              href="#contact"
              className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-widest border border-border text-text-dim hover:border-muted hover:text-text transition-all duration-200"
              style={{ letterSpacing: '0.14em' }}
            >
              COMMISSION
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Contained Precision Telemetry Capsule (Centered) ── */}
      <div className="relative z-10 mt-auto pb-6 sm:pb-8 px-5 sm:px-8 max-w-7xl w-full mx-auto flex justify-center">
        <div 
          className="flex items-center rounded-xl sm:rounded-full bg-[var(--c-surface)]/85 backdrop-blur-md border border-[var(--c-border)] shadow-lg overflow-hidden py-2 px-3 sm:px-4 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto"
        >
          {/* Fixed Leading Telemetry Label */}
          <div className="flex-none flex items-center gap-2 pr-3 sm:pr-4 border-r border-[var(--c-border)] font-mono text-[0.625rem] text-[var(--c-text)] font-bold tracking-wider uppercase select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-tally animate-pulse" />
            <span className="hidden sm:inline">SUITE SPECS //</span>
            <span className="sm:hidden">SPECS</span>
          </div>

          {/* Smooth Fade-Masked Ticker Track */}
          <div 
            className="flex-1 overflow-hidden relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <div className="ticker-track">
              {tickerContent.map((item, i) => (
                <span
                  key={i}
                  className="font-mono uppercase whitespace-nowrap px-4 sm:px-6 text-[var(--c-text-dim)]"
                  style={{ fontSize: '0.625rem', letterSpacing: '0.16em' }}
                >
                  {item}
                  <span className="inline-block w-1 h-1 rounded-full bg-acid mx-4 sm:mx-6 translate-y-[-1px] opacity-80" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
