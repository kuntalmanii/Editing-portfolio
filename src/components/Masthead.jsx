import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useTimecode } from '../hooks/useTimecode';
import { siteMeta } from '../data/portfolioData';
import { isAudioEnabled, toggleAudio, playClickSound } from '../utils/audioSystem';

// ── Commission status cycling ───────────────────────────────────────────────
const STATUS_LABELS = [
  { text: 'OPEN FOR COMMISSION', color: 'tally' },
  { text: 'BOOKING Q4 2026', color: 'tally' },
  { text: 'DM TO INQUIRE', color: 'acid' },
];

export default function Masthead() {
  const timecode = useTimecode(24);
  const [activeNav, setActiveNav] = useState(null);
  const [statusIdx, setStatusIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(isAudioEnabled());

  useEffect(() => {
    const handleAudioEvent = (e) => setAudioActive(e.detail.enabled);
    window.addEventListener('framerate-audio-changed', handleAudioEvent);
    return () => window.removeEventListener('framerate-audio-changed', handleAudioEvent);
  }, []);

  const handleToggleAudio = () => {
    const next = toggleAudio();
    setAudioActive(next);
  };

  // Cycle commission status every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_LABELS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const status = STATUS_LABELS[statusIdx];

  // Split timecode for styling frames separately
  const tcParts = timecode.split(':');
  const tcMain = tcParts.slice(0, 3).join(':');
  const tcFrames = tcParts[3] ?? '00';

  return (
    <header className="masthead">
      {/* ── Main bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 md:px-8 h-12">

        {/* LEFT: wordmark + timecode */}
        <div className="flex items-center gap-5">
          {/* Wordmark */}
          <a href="/" className="flex items-center gap-2.5 group select-none">
            {/* Tally dot */}
            <div className="tally-dot flex-shrink-0" />
            <span
              className="font-display font-bold text-base tracking-widest text-text leading-none group-hover:text-acid transition-colors duration-300"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '0.18em' }}
            >
              FRAME.RATE
            </span>
          </a>

          {/* Separator */}
          <span className="hidden sm:block w-px h-4 bg-border" />

          {/* Live timecode */}
          <div className="hidden sm:block timecode select-none" aria-label="Running timecode">
            <span>{tcMain}:</span>
            <span className="frames">{tcFrames}</span>
          </div>
        </div>

        {/* CENTER: Desktop nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {siteMeta.navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link ${activeNav === link.label ? 'nav-link-active' : ''}`}
              onClick={() => {
                playClickSound(1300, 0.04);
                setActiveNav(link.label);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* RIGHT: Commission status + Audio switch + hamburger */}
        <div className="flex items-center gap-3">

          {/* Audio Feedback Switch */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[0.5625rem] tracking-wider uppercase border transition-colors ${
              audioActive
                ? 'bg-[#E2F952]/10 border-acid/40 text-acid shadow-acid-glow'
                : 'bg-[#14141A] border-[#27272A] text-[#71717A] hover:text-white'
            }`}
            title={audioActive ? 'Audio Feedback ON (Click to mute)' : 'Audio Feedback MUTED (Click to enable)'}
          >
            {audioActive ? <Volume2 className="w-3 h-3 text-acid" /> : <VolumeX className="w-3 h-3 text-[#52525B]" />}
            <span className="hidden sm:inline font-semibold">{audioActive ? 'FX ON' : 'MUTE'}</span>
          </button>

          {/* Commission pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIdx}
              className="commission-pill hidden sm:flex"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="tally-dot"
                style={status.color === 'acid'
                  ? { background: '#E2F952', boxShadow: '0 0 8px 2px rgba(226,249,82,0.5)' }
                  : {}}
              />
              <span style={status.color === 'acid' ? { color: '#E2F952' } : {}}>
                {status.text}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden flex flex-col gap-1 p-1.5"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span
              className="block h-px w-5 bg-text-dim transition-all duration-200"
              style={{ transform: menuOpen ? 'rotate(45deg) translate(2px,3px)' : 'none' }}
            />
            <span
              className="block h-px bg-text-dim transition-all duration-200"
              style={{ width: menuOpen ? '20px' : '12px', opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-px w-5 bg-text-dim transition-all duration-200"
              style={{ transform: menuOpen ? 'rotate(-45deg) translate(2px,-3px)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* ── Telemetry sub-bar ────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-4 px-5 md:px-8 h-7 border-t border-border/40">
        <TelemetryItem label="EDITOR" value="Arjun Mehta" />
        <span className="text-border">·</span>
        <TelemetryItem label="LOCATION" value="Mumbai → Global" />
        <span className="text-border">·</span>
        <TelemetryItem label="PIPELINE" value="DaVinci Resolve 19" />
        <span className="text-border">·</span>
        <TelemetryItem label="SPEC" value="ACES / P3-D65 / HDR" />
        <span className="flex-1" />
        {/* Frame counter visual */}
        <div className="flex items-center gap-1">
          <span className="text-muted font-mono text-xs opacity-50">▶</span>
          <div className="timecode text-xs opacity-60 select-none">
            <span>REC </span>
            <span className="frames">{tcFrames}</span>
            <span className="opacity-40">fps/24</span>
          </div>
        </div>
      </div>

      {/* ── Mobile nav drawer ────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="flex flex-col py-3 px-5 gap-3">
              {siteMeta.navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="nav-link py-1.5 text-sm"
                  onClick={() => { setActiveNav(link.label); setMenuOpen(false); }}
                >
                  {link.label}
                </a>
              ))}
              {/* Timecode in mobile */}
              <div className="timecode mt-2 opacity-50 select-none">
                TC {tcMain}:<span className="frames">{tcFrames}</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Small telemetry cell ──────────────────────────────────────────────────
function TelemetryItem({ label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-mono uppercase"
        style={{ fontSize: '0.55rem', letterSpacing: '0.14em', color: '#52525B' }}
      >
        {label}
      </span>
      <span
        className="font-mono"
        style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: '#A1A1AA' }}
      >
        {value}
      </span>
    </div>
  );
}
