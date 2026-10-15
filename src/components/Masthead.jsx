import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Sun,
  Moon,
  X, 
  ArrowUpRight, 
  Mail, 
  Copy, 
  Check, 
  Clock, 
  Activity, 
  Film,
  Sparkles
} from 'lucide-react';
import { useTimecode } from '../hooks/useTimecode';
import { siteMeta } from '../data/portfolioData';
import { isAudioEnabled, toggleAudio, playClickSound, playSuccessSound } from '../utils/audioSystem';
import { getTheme, toggleTheme } from '../utils/themeSystem';

// ─────────────────────────────────────────────────────────────────────────────
// Masthead (Cinematic Editorial HUD)
// - Gliding pill active-section spy (smooth spring across nav items)
// - Razor-thin scroll progress hairline (film transport progress)
// - Audio waveform bars (animated dancing equalizer when FX ON)
// - Click-to-contact interactive commission pill
// - Timecode mode toggle (SMPTE vs Total Frames vs Local Time)
// - Fullscreen cinematic mobile overlay with oversized Syne typography
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS = [
  { text: 'OPEN FOR COMMISSION', color: 'tally', hint: 'INQUIRE NOW' },
  { text: 'BOOKING Q4 2026', color: 'tally', hint: 'RESERVE DATES' },
  { text: 'DM TO INQUIRE', color: 'acid', hint: 'START DISPATCH' },
];

const SECTIONS = [
  { id: 'work', label: 'WORK', num: '01' },
  { id: 'vault', label: 'RAW VAULT', num: '02' },
  { id: 'process', label: 'PROCESS', num: '03' },
  { id: 'contact', label: 'CONTACT', num: '04' },
];

export default function Masthead() {
  const timecode = useTimecode(24);
  const [activeSection, setActiveSection] = useState('work');
  const [statusIdx, setStatusIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(isAudioEnabled());
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timecodeMode, setTimecodeMode] = useState('SMPTE'); // 'SMPTE', 'FRAMES', 'CLOCK'
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [localClock, setLocalClock] = useState('');

  // ── Sync Audio Toggle State ──────────────────────────────────────────────
  useEffect(() => {
    const handleAudioEvent = (e) => setAudioActive(e.detail.enabled);
    window.addEventListener('framerate-audio-changed', handleAudioEvent);
    return () => window.removeEventListener('framerate-audio-changed', handleAudioEvent);
  }, []);

  const handleToggleAudio = (e) => {
    e?.stopPropagation();
    const next = toggleAudio();
    setAudioActive(next);
  };

  // ── Sync Theme Toggle State ──────────────────────────────────────────────
  useEffect(() => {
    const handleThemeEvent = (e) => setCurrentTheme(e.detail.theme);
    window.addEventListener('framerate-theme-changed', handleThemeEvent);
    return () => window.removeEventListener('framerate-theme-changed', handleThemeEvent);
  }, []);

  const handleToggleTheme = (e) => {
    e?.stopPropagation();
    const next = toggleTheme();
    setCurrentTheme(next);
  };

  // ── Scroll Progress & Scrolled State ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsScrolled(scrollY > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active Section Intersection Observer (Scroll-Spy) ─────────────────────
  useEffect(() => {
    const sectionElements = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    sectionElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Cycle commission status every 4 seconds ──────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_LABELS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // ── Local IST Clock ──────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      try {
        const ist = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLocalClock(ist);
      } catch (e) {
        setLocalClock('14:40:00');
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Lock body scroll when mobile overlay is open ─────────────────────────
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Timecode formatting ──────────────────────────────────────────────────
  const tcParts = timecode.split(':');
  const tcMain = tcParts.slice(0, 3).join(':');
  const tcFrames = tcParts[3] ?? '00';
  
  // Approximate total frames (HH * 3600 + MM * 60 + SS) * 24 + FF
  const totalFramesApprox = useMemo(() => {
    const [h, m, s, f] = tcParts.map(Number);
    return ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 24 + (f || 0);
  }, [tcParts]);

  const cycleTimecodeMode = () => {
    playClickSound(1500, 0.04);
    setTimecodeMode(m => m === 'SMPTE' ? 'FRAMES' : m === 'FRAMES' ? 'CLOCK' : 'SMPTE');
  };

  const copyEmailDirect = () => {
    playSuccessSound();
    navigator.clipboard?.writeText(siteMeta.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const status = STATUS_LABELS[statusIdx];

  return (
    <>
      <header 
        className={`masthead transition-all duration-300 ${
          isScrolled ? 'bg-[#08080A]/95 shadow-2xl backdrop-blur-2xl' : 'bg-[#08080A]/85 backdrop-blur-xl'
        }`}
      >
        {/* ── Main Bar (Height: 52px) ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-[52px]">

          {/* LEFT: Wordmark + Interactive Timecode */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Wordmark logo */}
            <a 
              href="#" 
              onClick={() => playClickSound(1200, 0.04)}
              className="flex items-center gap-2.5 group select-none"
            >
              <div className="tally-dot flex-shrink-0" />
              <span
                className="font-display font-black text-[0.95rem] tracking-[0.2em] text-white leading-none group-hover:text-acid transition-colors duration-300"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                FRAME.RATE
              </span>
            </a>

            <span className="hidden sm:block w-px h-4 bg-[#27272A]" />

            {/* Interactive Timecode Display with Mode Switching */}
            <button
              type="button"
              onClick={cycleTimecodeMode}
              title="Click to cycle timecode format (SMPTE / FRAMES / IST CLOCK)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111116] border border-[#1E1E24] hover:border-[#3F3F46] text-[#71717A] hover:text-white transition-all select-none font-mono text-[0.625rem]"
            >
              <Clock className="w-3 h-3 text-acid opacity-80" />
              {timecodeMode === 'SMPTE' ? (
                <div className="timecode flex items-center">
                  <span>{tcMain}:</span>
                  <span className="frames">{tcFrames}</span>
                  <span className="text-[0.5rem] text-[#52525B] ml-1.5 uppercase tracking-wider">24fps</span>
                </div>
              ) : timecodeMode === 'FRAMES' ? (
                <div className="font-mono text-acid font-bold">
                  {totalFramesApprox.toLocaleString()} <span className="text-[#52525B] font-normal">FR</span>
                </div>
              ) : (
                <div className="font-mono text-[#E4E4E7]">
                  {localClock} <span className="text-acid font-bold">IST</span>
                </div>
              )}
            </button>

          </div>

          {/* CENTER: Desktop Gliding-Pill Navigation ──────────────────────── */}
          <LayoutGroup id="navbar-pill">
            <nav className="hidden md:flex items-center p-1 rounded-full bg-[#101015]/90 border border-[#27272A] shadow-inner" aria-label="Main navigation">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;

                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => {
                      playClickSound(1300, 0.04);
                      setActiveSection(sec.id);
                    }}
                    className={`relative px-4 py-1.5 rounded-full font-mono text-[0.6875rem] uppercase tracking-wider transition-colors z-10 flex items-center gap-1.5 ${
                      isActive ? 'text-acid font-bold' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {/* Active Gliding Pill Background */}
                    {isActive && (
                      <motion.div
                        layoutId="navGlidingPill"
                        className="absolute inset-0 rounded-full bg-[#181822] border border-acid/35 shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 text-[0.55rem] text-[#52525B]">{sec.num}</span>
                    <span className="relative z-10">{sec.label}</span>
                  </a>
                );
              })}
            </nav>
          </LayoutGroup>

          {/* RIGHT: Commission Pill + Audio Switch + Mobile Hamburger ───────── */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Audio Waveform Feedback Switch */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full font-mono text-[0.5625rem] tracking-wider uppercase border transition-all ${
                audioActive
                  ? 'bg-acid/[0.08] border-acid/40 text-acid shadow-acid-glow'
                  : 'bg-[#121217] border-[#27272A] text-[#71717A] hover:text-[#D4D4D8] hover:border-[#3F3F46]'
              }`}
              title={audioActive ? 'Audio Feedback ON (Click to mute)' : 'Audio Feedback MUTED (Click to enable)'}
            >
              {audioActive ? (
                /* Animated Equalizer Waveform Bars */
                <div className="flex items-end gap-0.5 h-3 px-0.5">
                  <span className="w-0.5 bg-acid rounded-t-sm wave-bar-1" />
                  <span className="w-0.5 bg-acid rounded-t-sm wave-bar-2" />
                  <span className="w-0.5 bg-acid rounded-t-sm wave-bar-3" />
                </div>
              ) : (
                <VolumeX className="w-3 h-3 text-[#52525B]" />
              )}
              <span className="hidden sm:inline font-bold">
                {audioActive ? 'FX ON' : 'FX OFF'}
              </span>
            </button>

            {/* Studio Theme Switch Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[0.5625rem] tracking-wider uppercase border transition-all ${
                currentTheme === 'light'
                  ? 'bg-white border-[#CBD5E1] text-[#09090B] shadow-sm hover:border-[#94A3B8]'
                  : 'bg-[#121217] border-[#27272A] text-[#D4D4D8] hover:text-white hover:border-acid/40'
              }`}
              title={currentTheme === 'dark' ? 'Switch to Daylight Studio Mode' : 'Switch to Dark Room Mode'}
            >
              {currentTheme === 'light' ? (
                <Sun className="w-3 h-3 text-[#E02E24]" />
              ) : (
                <Moon className="w-3 h-3 text-acid" />
              )}
              <span className="hidden sm:inline font-bold">
                {currentTheme === 'light' ? 'DAYLIGHT' : 'DARK ROOM'}
              </span>
            </button>

            {/* Click-to-Contact Commission Pill */}
            <a
              href="#contact"
              onClick={() => playClickSound(1400, 0.05)}
              className="hidden sm:flex group relative items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121217] border border-[#27272A] hover:border-tally/50 transition-all font-mono text-[0.625rem] tracking-wider uppercase shadow-sm"
              title="Click to jump to Inquiry Terminal"
            >
              <div
                className="tally-dot"
                style={status.color === 'acid'
                  ? { background: '#E2F952', boxShadow: '0 0 8px 2px rgba(226,249,82,0.5)' }
                  : {}}
              />
              <span 
                className="font-semibold transition-colors"
                style={{ color: status.color === 'acid' ? '#E2F952' : '#FF3B30' }}
              >
                {status.text}
              </span>
              <ArrowUpRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 rounded-md bg-[#121217] border border-[#27272A] p-1.5"
              aria-label="Toggle Navigation Menu"
              onClick={() => {
                playClickSound(1200, 0.04);
                setMenuOpen(v => !v);
              }}
            >
              <span
                className="block h-[1.5px] w-4 bg-text transition-all duration-200"
                style={{ transform: menuOpen ? 'rotate(45deg) translate(2.5px, 3.5px)' : 'none' }}
              />
              <span
                className="block h-[1.5px] bg-text transition-all duration-200 my-1"
                style={{ width: menuOpen ? '16px' : '10px', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] w-4 bg-text transition-all duration-200"
                style={{ transform: menuOpen ? 'rotate(-45deg) translate(2.5px, -3.5px)' : 'none' }}
              />
            </button>

          </div>

        </div>

        {/* ── Telemetry Sub-Bar (Height: 26px) ───────────────────────────── */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 md:px-8 h-[26px] border-t border-[#1C1C22] bg-[#0A0A0D]/90 text-[#71717A] font-mono text-[0.5625rem]">
          <div className="flex items-center gap-4">
            <TelemetryItem label="FINISHING" value={siteMeta.editor} />
            <span className="text-[#27272A]">·</span>
            <TelemetryItem label="SUITE" value="DaVinci Resolve 19" />
            <span className="text-[#27272A]">·</span>
            <TelemetryItem label="COLOR PIPELINE" value="ACEScc 1.3 / P3-D65" highlight={true} />
            <span className="text-[#27272A] hidden lg:inline">·</span>
            <span className="hidden lg:inline text-[#52525B]">MONITOR: Flanders QD-OLED</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#A1A1AA]">
              <span className="w-1.5 h-1.5 rounded-full bg-tally animate-pulse" />
              <span>REC 24fps</span>
            </span>
            <span className="text-[#27272A]">|</span>
            <span className="text-acid">{localClock} IST</span>
          </div>
        </div>

        {/* ── Scroll Progress Hairline Indicator (1.5px) ────────────────── */}
        <div className="relative h-[1.5px] w-full bg-[#181820] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-acid via-acid to-tally shadow-acid-glow"
            style={{ width: `${scrollProgress}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </div>

      </header>

      {/* ── Fullscreen Cinematic Mobile Overlay ────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#08080A]/96 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-8 md:hidden"
          >
            {/* Overlay Top Bar */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2 select-none">
                <div className="tally-dot" />
                <span className="font-display font-black text-lg tracking-widest text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  FRAME.RATE
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound(1000, 0.04);
                  setMenuOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-[#16161D] border border-[#27272A] text-white flex items-center justify-center hover:border-acid transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Center Navigation Links (Oversized Syne Display Type) */}
            <nav className="flex flex-col gap-5 py-6">
              {SECTIONS.map((sec, idx) => {
                const isActive = activeSection === sec.id;

                return (
                  <motion.a
                    key={sec.id}
                    href={`#${sec.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * idx, duration: 0.3 }}
                    onClick={() => {
                      playClickSound(1400, 0.04);
                      setActiveSection(sec.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-baseline gap-4 group"
                  >
                    <span className="font-mono text-xs text-[#52525B] group-hover:text-acid transition-colors">
                      {sec.num}
                    </span>
                    <span
                      className={`font-display font-extrabold tracking-tight transition-colors text-3xl sm:text-4xl ${
                        isActive ? 'text-acid' : 'text-white group-hover:text-acid'
                      }`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {sec.label}
                    </span>
                  </motion.a>
                );
              })}
            </nav>

            {/* Overlay Bottom Controls & Telemetry */}
            <div className="border-t border-[#27272A] pt-5 space-y-4">
              
              {/* Audio toggle + timecode row */}
              <div className="flex items-center justify-between font-mono text-xs">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
                >
                  {audioActive ? <Volume2 className="w-4 h-4 text-acid" /> : <VolumeX className="w-4 h-4 text-[#52525B]" />}
                  <span>AUDIO FEEDBACK: <strong className={audioActive ? 'text-acid' : ''}>{audioActive ? 'ON' : 'MUTED'}</strong></span>
                </button>

                <span className="text-[#52525B]">
                  {localClock} IST
                </span>
              </div>

              {/* Theme toggle row */}
              <div className="flex items-center justify-between font-mono text-xs">
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
                >
                  {currentTheme === 'light' ? <Sun className="w-4 h-4 text-[#E02E24]" /> : <Moon className="w-4 h-4 text-acid" />}
                  <span>STUDIO THEME: <strong className={currentTheme === 'light' ? 'text-[#E02E24]' : 'text-acid'}>{currentTheme === 'light' ? 'DAYLIGHT' : 'DARK ROOM'}</strong></span>
                </button>

                <span className="text-[0.625rem] px-2 py-0.5 rounded border border-[#27272A] text-[#71717A]">
                  {currentTheme === 'light' ? 'HIGH-KEY' : 'ONYX'}
                </span>
              </div>

              {/* Commission CTA button */}
              <a
                href="#contact"
                onClick={() => {
                  playClickSound(1400, 0.04);
                  setMenuOpen(false);
                }}
                className="w-full py-3 rounded-lg bg-acid text-black font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-acid-glow"
              >
                <span>OPEN FOR COMMISSION — INQUIRE</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* Quick email copy button */}
              <button
                type="button"
                onClick={copyEmailDirect}
                className="w-full py-2.5 rounded-lg bg-[#111116] border border-[#27272A] text-[#A1A1AA] font-mono text-[0.6875rem] flex items-center justify-center gap-2 hover:border-[#52525B]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-acid" />
                    <span className="text-acid">COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{siteMeta.email} (TAP TO COPY)</span>
                  </>
                )}
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Telemetry Cell Helper ────────────────────────────────────────────────────
function TelemetryItem({ label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono uppercase text-[0.5rem] tracking-wider text-[#52525B]">
        {label}:
      </span>
      <span className={`font-mono text-[0.5625rem] tracking-wide ${highlight ? 'text-acid font-semibold' : 'text-[#A1A1AA]'}`}>
        {value}
      </span>
    </div>
  );
}
