import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Film, Monitor, Volume2, VolumeX } from 'lucide-react';
import BeforeAfterViewer from './BeforeAfterViewer';
import { siteMeta } from '../data/portfolioData';

// ─────────────────────────────────────────────────────────────────────────────
// ProjectModal
// High-density inspection modal: timecode scrubber, before/after, grade specs,
// software stack badges, project metadata.
// ─────────────────────────────────────────────────────────────────────────────

const BACKDROP = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const PANEL = {
  hidden:  { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
};

export default function ProjectModal({ project, onClose }) {
  const [scrubPct, setScrubPct] = useState(0);
  const [activeTab, setActiveTab] = useState('GRADE');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const scrubRef = useRef(null);
  const rafRef = useRef(null);

  // ── Lock body scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Escape key closes ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Timecode from scrub position ─────────────────────────────────────────
  const totalSec = project.runTimeSeconds ?? 0;
  const currentSec = Math.floor((scrubPct / 100) * totalSec);
  const tc = secToTC(currentSec);

  // ── Video sync with scrub ─────────────────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const t = (scrubPct / 100) * vid.duration;
    if (Math.abs(vid.currentTime - t) > 0.5) vid.currentTime = t;
  }, [scrubPct]);

  // ── Scrub bar pointer state & ref ────────────────────────────────────────
  const [scrubDragging, setScrubDragging] = useState(false);
  const scrubDraggingRef = useRef(false);
  scrubDraggingRef.current = scrubDragging;

  // ── Update scrub from video playback ─────────────────────────────────────
  const syncScrub = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    if (!scrubDraggingRef.current) {
      setScrubPct((vid.currentTime / vid.duration) * 100);
    }
    rafRef.current = requestAnimationFrame(syncScrub);
  }, []);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(syncScrub);
          })
          .catch(() => {
            // Browser autoplay/sound policy rejection fallback to muted
            vid.muted = true;
            setIsMuted(true);
            vid.play()
              .then(() => {
                setIsVideoPlaying(true);
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(syncScrub);
              })
              .catch(() => {
                setIsVideoPlaying(false);
              });
          });
      }
    } else {
      vid.pause();
      setIsVideoPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !vid.muted;
    vid.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {
          // ignore error
        }
      }
    };
  }, []);

  const handleScrub = useCallback((clientX) => {
    if (!scrubRef.current) return;
    const rect = scrubRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setScrubPct(pct);
  }, []);

  useEffect(() => {
    if (!scrubDragging) return;
    const onMove = (e) => handleScrub(e.touches ? e.touches[0].clientX : e.clientX);
    const onUp = () => setScrubDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [scrubDragging, handleScrub]);

  const TABS = ['GRADE', 'PROJECT', 'COMPARE'];

  return (
    <motion.div
      key="backdrop"
      variants={BACKDROP}
        initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="panel"
          variants={PANEL}
          initial="hidden" animate="visible" exit="exit"
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-200"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Top bar: title + close ───────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
            <div className="flex items-center gap-4">
              {/* Tally rec indicator */}
              <span className="tally-dot" />
              <div>
                <p className="font-display font-bold text-[var(--c-text)]" style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', letterSpacing: '0.06em' }}>
                  {project.title}
                </p>
                <p className="font-mono text-[var(--c-text-dim)]" style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1 }}>
                  {project.category} · {project.client} · {project.year}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-sm transition-colors hover:text-[var(--c-text)]"
              style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-dim)' }}
              aria-label="Close modal"
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Scrollable body ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* Video preview + scrubber */}
            <div style={{ background: '#000', position: 'relative' }}>
              <video
                ref={videoRef}
                src={project.videoPreviewUrl}
                className="w-full"
                style={{
                  aspectRatio: project.aspect === '9:16' ? '9/16' : '16/9',
                  objectFit: 'contain',
                  maxHeight: project.aspect === '9:16' ? 440 : 320,
                  display: 'block',
                  margin: '0 auto',
                }}
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
                poster={project.coverImage}
                onEnded={() => setIsVideoPlaying(false)}
              />
              {/* Play overlay */}
              {!isVideoPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.35)', cursor: 'pointer' }}
                  onClick={togglePlay}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full"
                    style={{ border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(8,8,10,0.7)', backdropFilter: 'blur(4px)' }}
                  >
                    <Play size={18} style={{ color: '#fff', marginLeft: 2 }} />
                  </div>
                </div>
              )}
              {/* Video controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
                {/* Timecode scrub bar */}
                <div
                  ref={scrubRef}
                  className="relative h-1 rounded-full mb-2 cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  onMouseDown={(e) => { setScrubDragging(true); handleScrub(e.clientX); }}
                  onTouchStart={(e) => { setScrubDragging(true); handleScrub(e.touches[0].clientX); }}
                  onClick={(e) => handleScrub(e.clientX)}
                >
                  {/* Fill */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${scrubPct}%`, background: '#E2F952', transition: scrubDragging ? 'none' : 'width 0.1s' }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${scrubPct}%`, transform: 'translate(-50%,-50%)', background: '#E2F952', boxShadow: '0 0 6px rgba(226,249,82,0.6)' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="font-mono text-xs text-text-dim hover:text-white transition-colors flex items-center gap-1.5"
                      title={isVideoPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isVideoPlaying
                        ? <Pause size={11} />
                        : <Play size={11} />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="font-mono text-xs text-text-dim hover:text-white transition-colors flex items-center"
                      title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                    >
                      {isMuted ? <VolumeX size={13} className="text-zinc-500" /> : <Volume2 size={13} className="text-acid" />}
                    </button>
                    {/* Live TC readout */}
                    <span
                      className="font-mono"
                      style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#E2F952', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {tc}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#A1A1AA' }}>
                    {project.runTime} · {project.aspect}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tab bar ──────────────────────────────────────────────────── */}
            <div className="flex" style={{ borderBottom: '1px solid var(--c-border)' }}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-5 py-2.5 font-mono uppercase transition-colors"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.18em',
                      color: isActive ? 'var(--c-text)' : 'var(--c-text-dim)',
                      fontWeight: isActive ? 700 : 500,
                      borderBottom: isActive ? '2px solid var(--c-text)' : '2px solid transparent',
                      background: 'transparent',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* ── Tab content ──────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.22 } }}
                exit={{ opacity: 0 }}
              >
                {activeTab === 'GRADE' && (
                  <GradeTab project={project} />
                )}
                {activeTab === 'PROJECT' && (
                  <ProjectTab project={project} />
                )}
                {activeTab === 'COMPARE' && (
                  <div>
                    <BeforeAfterViewer
                      before={project.beforeAfterImages?.before}
                      after={project.beforeAfterImages?.after}
                      gradeSpecs={project.gradeSpecs}
                      project={project}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
  );
}

// ── Grade tab ────────────────────────────────────────────────────────────────
function GradeTab({ project }) {
  const { gradeSpecs, softwareStack, deliverables, colorSpace } = project;
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Grade breakdown */}
      <div>
        <SectionLabel>Colour Grade</SectionLabel>
        <div className="flex flex-col gap-3 mt-3">
          {gradeSpecs && Object.entries({
            'Base Profile':     gradeSpecs.baseProfile,
            'Node Count':       `${gradeSpecs.nodes} nodes`,
            'LUT Applied':      gradeSpecs.lutApplied,
            'Colour Transform': gradeSpecs.colorTransform,
            'Primary Grade':    gradeSpecs.primaryGrade,
            'Noise / Grain':    gradeSpecs.noiseReduction,
            'Colour Space':     colorSpace,
          }).map(([k, v]) => (
            <ModalMetaRow key={k} label={k} value={v} />
          ))}
        </div>

        {/* Node visualiser */}
        {gradeSpecs && (
          <div className="mt-4">
            <p className="font-mono uppercase mb-2" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: '#52525B' }}>
              Node Pipeline ({gradeSpecs.nodes})
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(gradeSpecs.nodes, 32) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 10, height: 10,
                    borderRadius: 2,
                    background: i === 0
                      ? '#E2F952'
                      : i === gradeSpecs.nodes - 1
                      ? '#FF3B30'
                      : 'rgba(226,249,82,0.15)',
                    border: '1px solid rgba(226,249,82,0.1)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Software + deliverables */}
      <div className="flex flex-col gap-5">
        {softwareStack && (
          <div>
            <SectionLabel>Software Stack</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {softwareStack.map((sw) => (
                <span
                  key={sw}
                  className="font-mono uppercase flex items-center gap-1.5 px-2.5 py-1"
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    color: 'var(--c-text)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 2,
                    background: 'var(--c-surface-inner)',
                  }}
                >
                  <Monitor size={9} style={{ color: 'var(--c-muted)' }} />
                  {sw}
                </span>
              ))}
            </div>
          </div>
        )}

        {deliverables && (
          <div>
            <SectionLabel>Deliverables</SectionLabel>
            <div className="flex flex-col gap-2 mt-3">
              {deliverables.map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-2 font-mono"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.06em', color: 'var(--c-text)' }}
                >
                  <Film size={10} style={{ color: 'var(--c-tally)', flexShrink: 0 }} />
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project tab ──────────────────────────────────────────────────────────────
function ProjectTab({ project }) {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <SectionLabel>Project Info</SectionLabel>
        <div className="flex flex-col gap-3 mt-3">
          {[
            ['Title',      project.title],
            ['Subtitle',   project.subtitle],
            ['Category',   project.category],
            ['Client',     project.client],
            ['Year',       project.year],
            ['Run Time',   project.runTime],
            ['Aspect',     project.aspect],
          ].map(([k, v]) => <ModalMetaRow key={k} label={k} value={String(v)} />)}
        </div>
      </div>
      <div>
        <SectionLabel>Credits</SectionLabel>
        <div className="flex flex-col gap-3 mt-3">
          {[
            ['Director', project.director],
            ['DOP',      project.dop],
            ['Editor',   siteMeta.editor],
            ['Colourist',siteMeta.editor],
          ].filter(([,v]) => v).map(([k, v]) => <ModalMetaRow key={k} label={k} value={v} />)}
        </div>

        <div className="mt-5">
          <SectionLabel>Description</SectionLabel>
          <p className="font-mono mt-2" style={{ fontSize: '0.68rem', letterSpacing: '0.03em', color: 'var(--c-text-dim)', lineHeight: 1.7 }}>
            {project.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="font-mono uppercase px-2 py-0.5"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.14em',
                color: 'var(--c-text)',
                border: '1px solid var(--c-border)',
                background: 'var(--c-surface-inner)',
                borderRadius: 1
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="font-mono uppercase" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--c-muted)', borderBottom: '1px solid var(--c-border)', paddingBottom: 6 }}>
      {children}
    </p>
  );
}

function ModalMetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono uppercase flex-shrink-0" style={{ fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--c-muted)' }}>
        {label}
      </span>
      <span className="font-mono text-right font-medium" style={{ fontSize: '0.65rem', letterSpacing: '0.04em', color: 'var(--c-text)' }}>
        {value}
      </span>
    </div>
  );
}

function secToTC(totalSec) {
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:00`;
}
