import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Lock, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Layers, 
  Clock, 
  Award, 
  Briefcase, 
  Wrench, 
  ChevronRight,
  ExternalLink,
  Film
} from 'lucide-react';
import { timelineTracks } from '../data/portfolioData';
import { playClickSound, playScrubTick, playSwitchSound } from '../utils/audioSystem';

// ─────────────────────────────────────────────────────────────────────────────
// TimelineResume
// NLE (Non-Linear Editor) timeline interface:
// - Track V1: Work Experience
// - Track V2: Notable Releases
// - Track A1: Technical Tooling
// - Playhead scrubber line with timecode readout
// - Scroll-driven sync + interactive drag scrubbing
// - Detailed clip inspector below timeline
// ─────────────────────────────────────────────────────────────────────────────

const RULER_TICKS = [
  { tc: '00:00:00:00', year: '2019', pct: 0 },
  { tc: '01:00:00:00', year: '2020', pct: 14.3 },
  { tc: '02:00:00:00', year: '2021', pct: 28.5 },
  { tc: '03:00:00:00', year: '2022', pct: 42.8 },
  { tc: '04:00:00:00', year: '2023', pct: 57.1 },
  { tc: '05:00:00:00', year: '2024', pct: 71.4 },
  { tc: '06:00:00:00', year: '2025', pct: 85.7 },
  { tc: '07:00:00:00', year: '2026+', pct: 100 },
];

export default function TimelineResume() {
  const [playheadPct, setPlayheadPct] = useState(35);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState(timelineTracks[0]?.clips[0] || null);
  const [trackStates, setTrackStates] = useState({
    'track-v1': { muted: false, solo: false, locked: false },
    'track-v2': { muted: false, solo: false, locked: false },
    'track-a1': { muted: false, solo: false, locked: false },
  });

  const sectionRef = useRef(null);
  const timelineTracksRef = useRef(null);
  const isDraggingRef = useRef(false);
  const playIntervalRef = useRef(null);

  // ── Scroll-linked playhead advance ───────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      if (!isDraggingRef.current && !isPlaying) {
        // Map scroll 0.15 → 0.85 to playhead 0 → 100%
        const mapped = Math.min(100, Math.max(0, (v - 0.15) / 0.7 * 100));
        setPlayheadPct(mapped);
      }
    });
  }, [scrollYProgress, isPlaying]);

  // ── Simulated Playback ───────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlayheadPct((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
        playScrubTick();
      }, 40);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  // ── Drag Scrubber Handling ───────────────────────────────────────────────
  const computeScrubFromClientX = useCallback((clientX) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(100, Math.max(0, rawPct));
    setPlayheadPct(clamped);
    playScrubTick();
  }, []);

  const onMouseDownTimeline = (e) => {
    isDraggingRef.current = true;
    setIsPlaying(false);
    computeScrubFromClientX(e.clientX);

    const onMouseMove = (ev) => {
      if (!isDraggingRef.current) return;
      computeScrubFromClientX(ev.clientX);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStartTimeline = (e) => {
    isDraggingRef.current = true;
    setIsPlaying(false);
    computeScrubFromClientX(e.touches[0].clientX);

    const onTouchMove = (ev) => {
      if (!isDraggingRef.current) return;
      computeScrubFromClientX(ev.touches[0].clientX);
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Convert playhead percent to timecode string
  const currentFrameCount = Math.floor((playheadPct / 100) * (7 * 3600 * 24)); // 7 hours @ 24fps
  const hours = Math.floor(currentFrameCount / (3600 * 24));
  const mins = Math.floor((currentFrameCount % (3600 * 24)) / (60 * 24));
  const secs = Math.floor((currentFrameCount % (60 * 24)) / 24);
  const frames = Math.floor(currentFrameCount % 24);
  const playheadTC = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;

  const toggleTrackState = (trackId, key) => {
    playClickSound(1100, 0.03);
    setTrackStates((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [key]: !prev[trackId][key],
      },
    }));
  };

  return (
    <section 
      id="process" 
      ref={sectionRef} 
      className="relative py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto"
    >

      {/* ── Section Heading ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-acid shadow-acid-glow" />
            <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase">
              NLE CONFORM // 03
            </span>
          </div>

          <h2
            className="font-display font-extrabold text-white"
            style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              letterSpacing: '-0.03em', 
              lineHeight: 1 
            }}
          >
            TIMELINE RESUME
          </h2>

          <p className="font-mono text-[0.6875rem] text-[#A1A1AA] tracking-wider mt-3 max-w-xl">
            Career milestones, commercial releases, and post-production software pipeline laid out as non-linear editing tracks.
          </p>
        </div>

        {/* NLE Sequence Telemetry Bar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[0.625rem]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111116] border border-[#27272A] text-[#A1A1AA]">
            <Film className="w-3.5 h-3.5 text-acid" />
            <span>SEQ: MANISH_CAREER_CONFORM.drp</span>
          </div>

          {/* Live Scrubber Readout */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#16161E] border border-acid/30 text-white font-bold">
            <Clock className="w-3.5 h-3.5 text-acid" />
            <span className="text-acid">{playheadTC}</span>
            <span className="text-[#52525B]">@ 24fps</span>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound(1200, 0.05);
              if (playheadPct >= 100) setPlayheadPct(0);
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors uppercase tracking-wider font-semibold ${
              isPlaying
                ? 'bg-acid text-black border-acid shadow-acid-glow'
                : 'bg-[#1C1C24] text-white border-[#3F3F46] hover:border-acid/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>SCRUB PLAY</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound(900, 0.04);
              setPlayheadPct(0);
              setIsPlaying(false);
            }}
            title="Reset to 00:00:00:00"
            className="p-1.5 rounded bg-[#111116] border border-[#27272A] text-[#71717A] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── NLE Timeline Main Container ─────────────────────────────────── */}
      <div className="rounded-xl bg-[#0B0B0E] border border-[#27272A] overflow-hidden shadow-2xl">

        {/* ── Top Transport Bar ─────────────────────────────────────────── */}
        <div className="px-4 py-2.5 bg-[#121217] border-b border-[#27272A] flex items-center justify-between text-[#71717A] font-mono text-[0.625rem]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] opacity-80" />
              <span className="w-2 h-2 rounded-full bg-[#FF9500] opacity-80" />
              <span className="w-2 h-2 rounded-full bg-[#34C759] opacity-80" />
            </div>
            <span className="text-[#A1A1AA] font-bold">DAVINCI RESOLVE FINISHING TIMELINE</span>
            <span className="text-[#3F3F46] hidden sm:inline">|</span>
            <span className="text-[#52525B] hidden sm:inline">SAMPLE RATE: 48kHz · 24-BIT</span>
          </div>

          <div className="flex items-center gap-4 text-[#71717A]">
            <span className="hidden sm:inline">DRAG RULER TO SCRUB PLAYHEAD</span>
            <span className="px-2 py-0.5 rounded bg-[#1A1A22] border border-[#27272A] text-acid">
              SNAP: ON
            </span>
          </div>
        </div>

        {/* ── Timeline Body (Track Headers Left + Tracks Workspace Right) ── */}
        <div className="flex flex-col lg:flex-row overflow-x-auto">

          {/* Track Headers (Left Column) */}
          <div className="w-full lg:w-48 flex-none border-b lg:border-b-0 lg:border-r border-[#27272A] bg-[#0E0E13] flex flex-col">
            
            {/* Header spacer aligned with ruler */}
            <div className="h-9 px-3 border-b border-[#27272A] flex items-center justify-between text-[#71717A] font-mono text-[0.5625rem]">
              <span className="tracking-widest uppercase">TRACK // ID</span>
              <span>STATE</span>
            </div>

            {/* Individual track control strips */}
            {timelineTracks.map((track) => {
              const state = trackStates[track.id] || {};
              return (
                <div 
                  key={track.id} 
                  className="h-28 px-3 border-b border-[#1E1E24] last:border-b-0 flex flex-col justify-between py-3 bg-[#0D0D12]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-mono text-[0.6875rem] font-bold px-1.5 py-0.5 rounded border"
                        style={{ 
                          color: track.color, 
                          borderColor: `${track.color}40`,
                          backgroundColor: `${track.color}10` 
                        }}
                      >
                        {track.label}
                      </span>
                      <span className="font-mono text-[0.625rem] text-[#D4D4D8] font-bold tracking-wider">
                        {track.name}
                      </span>
                    </div>
                  </div>

                  {/* NLE Mute / Solo / Lock Button Cluster */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {/* Solo Button */}
                    <button
                      type="button"
                      onClick={() => toggleTrackState(track.id, 'solo')}
                      title="Solo track"
                      className={`px-2 py-1 rounded font-mono text-[0.5625rem] font-bold tracking-wider transition-colors ${
                        state.solo
                          ? 'bg-[#E2F952] text-black shadow-acid-glow'
                          : 'bg-[#181820] text-[#71717A] hover:text-white border border-[#27272A]'
                      }`}
                    >
                      S
                    </button>

                    {/* Mute Button */}
                    <button
                      type="button"
                      onClick={() => toggleTrackState(track.id, 'muted')}
                      title="Mute track"
                      className={`px-2 py-1 rounded font-mono text-[0.5625rem] font-bold tracking-wider transition-colors ${
                        state.muted
                          ? 'bg-[#FF3B30] text-white shadow-tally-glow'
                          : 'bg-[#181820] text-[#71717A] hover:text-white border border-[#27272A]'
                      }`}
                    >
                      M
                    </button>

                    {/* Lock Button */}
                    <button
                      type="button"
                      onClick={() => toggleTrackState(track.id, 'locked')}
                      title="Lock track"
                      className={`px-2 py-1 rounded font-mono text-[0.5625rem] font-bold tracking-wider transition-colors ${
                        state.locked
                          ? 'bg-[#38BDF8] text-black'
                          : 'bg-[#181820] text-[#71717A] hover:text-white border border-[#27272A]'
                      }`}
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </button>

                    <span className="font-mono text-[0.5rem] text-[#52525B] ml-auto">
                      {track.clips.length} CLIPS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracks Workspace (Right Area with Ruler & Playhead) */}
          <div 
            ref={timelineTracksRef}
            onMouseDown={onMouseDownTimeline}
            onTouchStart={onTouchStartTimeline}
            className="flex-1 relative bg-[#09090C] min-w-[680px] select-none cursor-crosshair overflow-hidden"
          >

            {/* ── Timecode Ruler ─────────────────────────────────────── */}
            <div className="h-9 border-b border-[#27272A] bg-[#0E0E14] relative flex items-center">
              {RULER_TICKS.map((tick, i) => (
                <div
                  key={tick.tc}
                  className="absolute top-0 bottom-0 flex flex-col justify-between font-mono text-[0.5625rem] text-[#52525B]"
                  style={{ left: `${tick.pct}%`, transform: tick.pct === 100 ? 'translateX(-100%)' : 'none' }}
                >
                  <div className="flex items-center gap-1 pt-1.5 pl-1.5">
                    <span className="text-[#A1A1AA] font-bold">{tick.year}</span>
                    <span className="text-[#3F3F46]">·</span>
                    <span className="hidden sm:inline text-[#71717A]">{tick.tc}</span>
                  </div>
                  <div className="w-px h-2 bg-[#27272A]" />
                </div>
              ))}

              {/* Sub-tick markers */}
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-px h-1.5 bg-[#1F1F26]"
                  style={{ left: `${(i / 28) * 100}%` }}
                />
              ))}
            </div>

            {/* ── Horizontal Tracks Body ─────────────────────────────── */}
            <div className="relative">

              {/* Background grid line dividers */}
              {RULER_TICKS.map((tick) => (
                <div
                  key={`grid-${tick.tc}`}
                  className="absolute top-0 bottom-0 w-px bg-[#181820] pointer-events-none"
                  style={{ left: `${tick.pct}%` }}
                />
              ))}

              {/* Tracks Container */}
              {timelineTracks.map((track) => {
                const isTrackMuted = trackStates[track.id]?.muted;
                const isTrackLocked = trackStates[track.id]?.locked;

                return (
                  <div
                    key={track.id}
                    className={`h-28 border-b border-[#1A1A22] last:border-b-0 relative p-2 transition-opacity ${
                      isTrackMuted ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {/* Render clips on this track */}
                    {track.clips.map((clip) => {
                      const isSelected = selectedClip?.id === clip.id;

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            playSwitchSound();
                            setSelectedClip(clip);
                          }}
                          style={{
                            left: `${clip.startPct}%`,
                            width: `${clip.widthPct}%`,
                          }}
                          className={`absolute top-2 bottom-2 rounded-md p-2 flex flex-col justify-between cursor-pointer transition-all group overflow-hidden border ${
                            isSelected
                              ? 'timeline-clip-selected border-acid bg-[#16161F] shadow-lg ring-1 ring-acid/50 z-20'
                              : 'border-[#27272A] bg-[#101015] hover:border-[#52525B] hover:bg-[#14141B] z-10'
                          }`}
                        >
                          {/* Clip Top Handle Grips & Duration */}
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#1E1E24]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span 
                                className="w-1.5 h-1.5 rounded-full flex-none"
                                style={{ backgroundColor: track.color }}
                              />
                              <span className="font-mono text-[0.5625rem] text-[#71717A] tracking-wider truncate">
                                {clip.startYear} — {clip.endYear}
                              </span>
                            </div>

                            <span className="font-mono text-[0.5rem] text-[#52525B] tracking-widest uppercase flex-none">
                              {clip.duration}
                            </span>
                          </div>

                          {/* Clip Title & Studio */}
                          <div className="min-w-0">
                            <p className={`clip-title font-mono text-[0.6875rem] font-bold tracking-tight truncate ${
                              isSelected ? 'text-acid' : 'text-white group-hover:text-acid'
                            }`}>
                              {clip.title}
                            </p>
                            <p className="font-mono text-[0.5625rem] text-[#A1A1AA] truncate mt-0.5">
                              {clip.studio}
                            </p>
                          </div>

                          {/* Clip Bottom Tags */}
                          <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
                            {clip.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[0.45rem] px-1.5 py-0.2 rounded bg-[#08080A] text-[#71717A] border border-[#1E1E24] tracking-wider uppercase flex-none"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Left/Right NLE Clip Resize Handles */}
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-white/10 group-hover:bg-acid/40 transition-colors" />
                          <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/10 group-hover:bg-acid/40 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* ── DRAGGABLE PLAYHEAD SCRUBBER LINE ─────────────────── */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
                style={{ 
                  left: `${playheadPct}%`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                {/* Playhead marker indicator head */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-tally drop-shadow-[0_0_6px_rgba(255,59,48,0.8)] -mt-9" />
                
                {/* Glowing vertical hairline spanning across all tracks */}
                <div className="w-[1.5px] h-full bg-tally shadow-tally-glow" />

                {/* Live frame counter pill above playhead */}
                <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-[#FF3B30] text-white font-mono text-[0.5rem] font-bold tracking-wider whitespace-nowrap shadow-md">
                  {playheadTC.split(':').slice(2).join(':')}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── Active Clip Inspection Panel (Bottom Strip) ──────────────── */}
        <AnimatePresence mode="wait">
          {selectedClip && (
            <motion.div
              key={selectedClip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="p-5 bg-[#101015] border-t border-[#27272A] flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              {/* Left description */}
              <div className="max-w-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.625rem] text-acid font-bold px-2 py-0.5 rounded bg-acid/10 border border-acid/30">
                    INSPECTED CLIP
                  </span>
                  <span className="font-mono text-[0.6875rem] text-[#71717A]">
                    {selectedClip.timecodeIn} → {selectedClip.timecodeOut}
                  </span>
                  <span className="text-[#3F3F46]">·</span>
                  <span className="font-mono text-[0.6875rem] text-[#D4D4D8]">
                    {selectedClip.location}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedClip.title}
                </h3>

                <p className="font-mono text-[0.6875rem] text-[#A1A1AA] leading-relaxed">
                  {selectedClip.description}
                </p>

                {/* Achievements bullets */}
                <div className="pt-2 space-y-1">
                  {selectedClip.achievements?.map((ach, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-[0.625rem] text-[#D4D4D8]">
                      <span className="w-1.5 h-1.5 rounded-full bg-acid flex-none" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right tech stack tags */}
              <div className="flex-none flex flex-col sm:items-end justify-between gap-4 font-mono text-[0.625rem]">
                <div className="space-y-1.5 text-right">
                  <span className="text-[#71717A] tracking-wider uppercase block">
                    PRODUCTION STACK
                  </span>
                  <div className="flex flex-wrap sm:justify-end gap-1.5">
                    {selectedClip.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded bg-[#16161D] border border-[#27272A] text-acid font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#71717A]">
                  <Briefcase className="w-3.5 h-3.5 text-acid" />
                  <span>{selectedClip.studio}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}
