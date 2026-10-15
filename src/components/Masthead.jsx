import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup, useScroll, useSpring } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Sun,
  Moon,
  X, 
  ArrowUpRight, 
  Mail, 
  Check,
  Clock
} from 'lucide-react';
import { useTimecode } from '../hooks/useTimecode';
import { siteMeta } from '../data/portfolioData';
import { isAudioEnabled, toggleAudio, playClickSound, playSuccessSound } from '../utils/audioSystem';
import { getTheme, toggleTheme } from '../utils/themeSystem';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Floating Masthead (Interactive Editorial Dock)
// - Floating dock architecture with spring physics on scroll
// - Magnetic hover gliding pill tracker across navigation items
// - Interactive running SMPTE Timecode with mode cycle & hover state
// - Dynamic dancing audio equalizer visualizer (wave-bar keyframes)
// - 360° spring-rotating studio theme switcher (Daylight vs Dark Room)
// - Integrated luminous scroll progress perimeter hairline
// - Fullscreen cinematic mobile overlay
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'work', label: 'WORK' },
  { id: 'colorlab', label: 'COLOR LAB' },
  { id: 'vault', label: 'RAW VAULT' },
  { id: 'process', label: 'TIMELINE' },
  { id: 'contact', label: 'CONTACT' },
];

export default function Masthead() {
  const timecode = useTimecode(24);
  const [activeSection, setActiveSection] = useState('work');
  const [hoveredNav, setHoveredNav] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(isAudioEnabled());
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [isScrolled, setIsScrolled] = useState(false);
  const [timecodeMode, setTimecodeMode] = useState('SMPTE'); // 'SMPTE', 'FRAMES', 'CLOCK'
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [localClock, setLocalClock] = useState('');
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  // ── Hardware-Accelerated Scroll Progress (Zero React Re-renders) ──────────
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  // Track if user clicked a nav tab to suppress scroll-spy during smooth scroll
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef(null);

  const handleNavClick = (id) => {
    playClickSound(1300, 0.04);
    setActiveSection(id);
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);
  };

  // ── Timecode formatting ──────────────────────────────────────────────────
  const tcParts = timecode.split(':');
  const tcMain = tcParts.slice(0, 3).join(':');
  const tcFrames = tcParts[3] ?? '00';
  
  const totalFramesApprox = useMemo(() => {
    const [h, m, s, f] = tcParts.map(Number);
    return ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 24 + (f || 0);
  }, [tcParts]);

  const cycleTimecodeMode = () => {
    playClickSound(1500, 0.04);
    setTimecodeMode(m => m === 'SMPTE' ? 'FRAMES' : m === 'FRAMES' ? 'CLOCK' : 'SMPTE');
  };

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

  // ── Scrolled Threshold State (Header Elevation & Scale) ───────────────────
  useEffect(() => {
    let lastScrolled = false;
    const onScroll = () => {
      const isScrolledNow = window.scrollY > 25;
      if (isScrolledNow !== lastScrolled) {
        lastScrolled = isScrolledNow;
        setIsScrolled(isScrolledNow);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Real-time Local Clock ────────────────────────────────────────────────
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
      } catch {
        setLocalClock('14:40:00');
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Deterministic, Flicker-Free Scroll-Spy ────────────────────────────────
  useEffect(() => {
    let ticking = false;

    const checkActiveSection = () => {
      // If user recently clicked a nav tab, don't override the tab during smooth scrolling
      if (isClickScrollingRef.current) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. Near the very top of the page (Hero Section), cleanly default to first item ('work')
      if (scrollY < 220) {
        setActiveSection('work');
        ticking = false;
        return;
      }

      // 2. Near the bottom of the page, activate 'contact'
      if (windowHeight + scrollY >= documentHeight - 120) {
        setActiveSection('contact');
        ticking = false;
        return;
      }

      // 3. Focal trigger line: 36% down the viewport (where content naturally centers)
      const focalLine = scrollY + (windowHeight * 0.36);

      let currentId = 'work';
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementDocTop = rect.top + scrollY;
          if (elementDocTop <= focalLine) {
            currentId = item.id;
          }
        }
      }

      setActiveSection(prev => (prev !== currentId ? currentId : prev));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Initial evaluation
    checkActiveSection();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // ── Lock body scroll when mobile menu is open ────────────────────────────
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const copyEmailDirect = () => {
    playSuccessSound();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(siteMeta.email);
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <>
      {/* ── Fixed Floating Dock Wrapper ───────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center pt-2.5 sm:pt-4 px-3 sm:px-6">
        
        {/* Dynamic Island Dock Container */}
        <motion.div
          animate={{
            y: 0,
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`pointer-events-auto relative w-full max-w-6xl rounded-2xl sm:rounded-full transition-all duration-300 border shadow-2xl backdrop-blur-2xl overflow-hidden ${
            isScrolled 
              ? 'bg-[var(--c-surface)]/92 border-[var(--c-border)] shadow-[0_16px_40px_rgba(0,0,0,0.5)]' 
              : 'bg-[var(--c-surface)]/80 border-[var(--c-border)] shadow-xl'
          }`}
        >
          {/* Main Content Row */}
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 h-[56px] sm:h-[60px]">

            {/* LEFT: Wordmark + Interactive Tally & Timecode Scrubber */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              
              {/* Brand Wordmark with Live Pulse */}
              <a 
                href="#" 
                onMouseEnter={() => setIsHoveringLogo(true)}
                onMouseLeave={() => setIsHoveringLogo(false)}
                onClick={() => playClickSound(1200, 0.04)}
                className="flex items-center gap-2.5 group select-none py-1"
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-tally animate-pulse" />
                  {isHoveringLogo && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute w-2 h-2 rounded-full bg-tally"
                    />
                  )}
                </div>
                
                <span
                  className="font-display font-black text-sm sm:text-base tracking-[0.18em] text-[var(--c-text)] leading-none group-hover:text-acid transition-colors duration-200"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  FRAME.RATE
                </span>
              </a>

              <span className="hidden sm:block w-px h-4 bg-[var(--c-border)]" />

              {/* Dynamic Interactive Timecode Pill */}
              <button
                type="button"
                onClick={cycleTimecodeMode}
                title="Click to cycle format (SMPTE / FRAMES / IST CLOCK)"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-surface-inner)] border border-[var(--c-border)] hover:border-acid/40 text-[var(--c-text-dim)] hover:text-[var(--c-text)] transition-all font-mono text-[0.625rem] select-none group/tc"
              >
                <Clock className="w-3 h-3 text-acid opacity-90 group-hover/tc:rotate-45 transition-transform duration-300" />
                {timecodeMode === 'SMPTE' ? (
                  <span className="flex items-center tracking-wider">
                    <span className="text-[var(--c-text)] font-semibold">{tcMain}:</span>
                    <span className="text-acid font-bold">{tcFrames}</span>
                    <span className="text-[0.5rem] text-[var(--c-muted)] ml-1.5 font-normal uppercase">24fps</span>
                  </span>
                ) : timecodeMode === 'FRAMES' ? (
                  <span className="text-acid font-bold tracking-wider">
                    {totalFramesApprox.toLocaleString()} <span className="text-[var(--c-muted)] font-normal text-[0.5rem]">FR</span>
                  </span>
                ) : (
                  <span className="text-[var(--c-text)] font-medium tracking-wider">
                    {localClock} <span className="text-acid font-bold text-[0.5rem]">IST</span>
                  </span>
                )}
              </button>
            </div>

            {/* CENTER: Magnetic Gliding Hover Navigation ───────────────────── */}
            <LayoutGroup id="dynamic-nav-pill">
              <nav 
                className="hidden md:flex items-center p-1 rounded-full bg-[var(--c-surface-inner)]/80 border border-[var(--c-border)] shadow-inner relative" 
                onMouseLeave={() => setHoveredNav(null)}
                aria-label="Main navigation"
              >
                {NAV_ITEMS.map((sec) => {
                  const isCurrentActive = activeSection === sec.id;
                  const isHovered = hoveredNav === sec.id;
                  const isHighlighted = hoveredNav !== null ? isHovered : isCurrentActive;

                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onMouseEnter={() => {
                        playClickSound(1800, 0.02);
                        setHoveredNav(sec.id);
                      }}
                      onClick={() => handleNavClick(sec.id)}
                      className={`relative px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-colors z-10 select-none ${
                        isHighlighted ? 'text-black font-bold' : 'text-[var(--c-text-dim)] hover:text-[var(--c-text)]'
                      }`}
                    >
                      {/* Active & Hover Gliding Pill Background */}
                      {isHighlighted && (
                        <motion.div
                          layoutId="dynamicNavGlidingPill"
                          className="absolute inset-0 rounded-full bg-acid shadow-acid-glow"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      <span className="relative z-10 flex items-center justify-center">
                        {sec.label}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </LayoutGroup>

            {/* RIGHT: Dynamic Action Cluster ───────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* Dynamic Audio Equalizer Waveform Button */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[0.625rem] tracking-wider uppercase border transition-all ${
                  audioActive
                    ? 'bg-acid/10 border-acid/50 text-acid shadow-acid-glow'
                    : 'bg-[var(--c-surface-inner)] border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
                title={audioActive ? 'Audio Feedback ON (Click to mute)' : 'Audio Feedback MUTED (Click to enable)'}
                aria-label="Toggle UI Audio"
              >
                {audioActive ? (
                  /* Animated Dancing Audio Waveform Bars */
                  <div className="flex items-end gap-0.5 h-3 px-0.5">
                    <span className="w-0.5 bg-acid rounded-t-sm wave-bar-1" />
                    <span className="w-0.5 bg-acid rounded-t-sm wave-bar-2" />
                    <span className="w-0.5 bg-acid rounded-t-sm wave-bar-3" />
                  </div>
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span className="hidden lg:inline font-bold">
                  {audioActive ? 'FX ON' : 'FX OFF'}
                </span>
              </button>

              {/* Studio Theme Switcher with 360° Spring Animation */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.88, rotate: 180 }}
                onClick={handleToggleTheme}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text-dim)] hover:text-[var(--c-text)] hover:border-acid/40 transition-all shadow-sm"
                title={currentTheme === 'dark' ? 'Switch to Daylight Theme' : 'Switch to Dark Room Theme'}
                aria-label="Toggle Theme"
              >
                {currentTheme === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-acid" />
                )}
              </motion.button>

              {/* Dynamic Inquire CTA Button */}
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => playClickSound(1400, 0.05)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-acid text-black font-mono text-xs font-bold tracking-wider uppercase hover:bg-white transition-all shadow-acid-glow"
              >
                <span>INQUIRE</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>

              {/* Mobile Hamburger Button */}
              <button
                className="md:hidden flex flex-col items-center justify-center w-8 h-8 rounded-full bg-[var(--c-surface-inner)] border border-[var(--c-border)] p-1.5 ml-1"
                aria-label="Toggle Navigation Menu"
                onClick={() => {
                  playClickSound(1200, 0.04);
                  setMenuOpen(v => !v);
                }}
              >
                <span
                  className="block h-[1.5px] w-4 bg-[var(--c-text)] transition-all duration-200"
                  style={{ transform: menuOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none' }}
                />
                <span
                  className="block h-[1.5px] bg-[var(--c-text)] transition-all duration-200 my-1"
                  style={{ width: menuOpen ? '16px' : '10px', opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="block h-[1.5px] w-4 bg-[var(--c-text)] transition-all duration-200"
                  style={{ transform: menuOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none' }}
                />
              </button>

            </div>

          </div>

          {/* ── Integrated Luminous Scroll Progress Line ─────────────────── */}
          <div className="h-[1.5px] w-full bg-[var(--c-border)]/40 overflow-hidden">
            <motion.div
              className="h-full bg-acid shadow-acid-glow origin-left"
              style={{ scaleX }}
            />
          </div>

        </motion.div>

      </header>

      {/* ── Fullscreen Clean Mobile Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] bg-[var(--c-bg)]/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-8 md:hidden"
          >
            {/* Overlay Top Bar */}
            <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-4">
              <div className="flex items-center gap-2 select-none">
                <span className="w-2 h-2 rounded-full bg-tally animate-pulse" />
                <span className="font-display font-black text-base tracking-widest text-[var(--c-text)]" style={{ fontFamily: "'Syne', sans-serif" }}>
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
                className="w-9 h-9 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] flex items-center justify-center hover:border-acid transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-6 py-8">
              {NAV_ITEMS.map((sec, idx) => {
                const isActive = activeSection === sec.id;

                return (
                  <motion.a
                    key={sec.id}
                    href={`#${sec.id}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * idx, duration: 0.25 }}
                    onClick={() => {
                      handleNavClick(sec.id);
                      setMenuOpen(false);
                    }}
                    className={`font-display font-extrabold tracking-tight transition-colors text-3xl ${
                      isActive ? 'text-acid' : 'text-[var(--c-text)] hover:text-acid'
                    }`}
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {sec.label}
                  </motion.a>
                );
              })}
            </nav>

            {/* Overlay Bottom Controls */}
            <div className="border-t border-[var(--c-border)] pt-5 space-y-4 font-mono text-xs">
              
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">Audio Feedback</span>
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className="px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-bold flex items-center gap-1.5"
                >
                  {audioActive ? <Volume2 className="w-3.5 h-3.5 text-acid" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--c-muted)]" />}
                  <span>{audioActive ? 'ENABLED' : 'MUTED'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">Theme Mode</span>
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-bold flex items-center gap-1.5"
                >
                  {currentTheme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-acid" />}
                  <span>{currentTheme === 'light' ? 'DAYLIGHT' : 'DARK ROOM'}</span>
                </button>
              </div>

              {/* Commission CTA */}
              <a
                href="#contact"
                onClick={() => {
                  playClickSound(1400, 0.04);
                  setMenuOpen(false);
                }}
                className="w-full py-3.5 rounded-xl bg-acid text-black font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-acid-glow mt-2"
              >
                <span>OPEN FOR COMMISSION — INQUIRE</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* Quick email copy button */}
              <button
                type="button"
                onClick={copyEmailDirect}
                className="w-full py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-dim)] font-mono text-xs flex items-center justify-center gap-2"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-acid" />
                    <span className="text-acid font-bold">COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{siteMeta.email}</span>
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
