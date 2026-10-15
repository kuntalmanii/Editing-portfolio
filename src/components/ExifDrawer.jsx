import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  Maximize2, 
  Folder, 
  MapPin, 
  Calendar, 
  Sliders, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Activity, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ExifDrawer
// Technical RAW still inspector overlay:
// - Dual toggle: "Inspect Base RAW" vs "View Processed Frame"
// - Technical EXIF readouts (Camera Body, Lens, Focal Length, Aperture, Shutter, ISO, File Size)
// - Callout badge: "Linked to Project [Project Name]"
// - RGB channel histogram visualization
// - Next/Prev still cycling within active directory
// ─────────────────────────────────────────────────────────────────────────────

const BACKDROP = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const DRAWER = {
  hidden: { x: '100%', opacity: 0.6 },
  visible: { 
    x: '0%', 
    opacity: 1, 
    transition: { type: 'spring', damping: 28, stiffness: 240 } 
  },
  exit: { 
    x: '100%', 
    opacity: 0, 
    transition: { duration: 0.25, ease: 'easeInOut' } 
  },
};

export default function ExifDrawer({ 
  item, 
  folder, 
  onClose, 
  onSelectNext, 
  onSelectPrev,
  hasNext = true,
  hasPrev = true 
}) {
  // Mode: 'RAW' (Inspect Base RAW) vs 'PROCESSED' (View Processed Frame)
  const [viewMode, setViewMode] = useState('PROCESSED');
  const [copiedFormat, setCopiedFormat] = useState(false);

  // ── Lock body scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // ── Keyboard shortcuts: ESC to close, Left/Right arrows to cycle ──────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onSelectNext && hasNext) {
        onSelectNext();
      } else if (e.key === 'ArrowLeft' && onSelectPrev && hasPrev) {
        onSelectPrev();
      } else if (e.key === 'Tab') {
        // Space / Tab quick preview toggle
        e.preventDefault();
        setViewMode((m) => (m === 'RAW' ? 'PROCESSED' : 'RAW'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSelectNext, onSelectPrev, hasNext, hasPrev]);

  if (!item) return null;

  const { exif, frameIndex, frameNumber, title, location, fileSize, fileFormat, linkedProject } = item;

  // Active image based on toggle
  const currentImage = viewMode === 'RAW' ? (item.rawImage || item.image) : (item.processedImage || item.image);

  const copyPath = () => {
    const fullPath = `${folder?.path || '/DCIM/'}${frameIndex}`;
    navigator.clipboard?.writeText(fullPath);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="EXIF Inspector">

        {/* ── Dark blur backdrop ────────────────────────────────────────── */}
        <motion.div
          key="exif-backdrop"
          variants={BACKDROP}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-[#08080A]/85 backdrop-blur-md cursor-pointer"
        />

        {/* ── Slide-in Inspector Drawer ─────────────────────────────────── */}
        <motion.aside
          key="exif-drawer-panel"
          variants={DRAWER}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full sm:max-w-xl md:max-w-2xl lg:max-w-[720px] h-full bg-[#0D0D11] border-l border-[#27272A] z-10 flex flex-col shadow-2xl"
          style={{ boxShadow: '-24px 0 60px rgba(0,0,0,0.85)' }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Drawer Top Header ─────────────────────────────────────────── */}
          <div className="flex-none px-6 py-4 border-b border-[#27272A] bg-[#111115] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 rounded-full bg-acid shadow-acid-glow flex-none" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase">
                    EXIF INSPECTOR //
                  </span>
                  <span className="font-mono text-[0.6875rem] text-acid font-bold tracking-wider truncate">
                    {frameIndex}
                  </span>
                </div>
                <p className="font-mono text-[0.5625rem] text-[#52525B] tracking-wider truncate mt-0.5">
                  MOUNT: {folder?.path || '/DCIM/'} · FRAME {frameNumber || '01'}
                </p>
              </div>
            </div>

            {/* Top action controls */}
            <div className="flex items-center gap-2 flex-none">
              {/* Cycle frames buttons */}
              <div className="flex items-center border border-[#27272A] rounded bg-[#08080A] p-0.5 mr-1">
                <button
                  type="button"
                  onClick={onSelectPrev}
                  disabled={!hasPrev}
                  title="Previous RAW still (Left Arrow)"
                  className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#1C1C22] disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-[#27272A]" />
                <button
                  type="button"
                  onClick={onSelectNext}
                  disabled={!hasNext}
                  title="Next RAW still (Right Arrow)"
                  className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#1C1C22] disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                title="Close Inspector (Esc)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#27272A] bg-[#16161C] text-[#A1A1AA] hover:text-white hover:border-[#52525B] transition-colors font-mono text-[0.625rem]"
              >
                <span className="hidden sm:inline tracking-wider">ESC</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Linked Project Callout Banner ─────────────────────────────── */}
          {linkedProject ? (
            <div className="flex-none px-6 py-2.5 bg-[#E2F952]/[0.06] border-b border-[#E2F952]/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Film className="w-3.5 h-3.5 text-acid flex-none" />
                <span className="font-mono text-[0.6875rem] text-acid font-semibold tracking-wider uppercase truncate">
                  LINKED TO PROJECT: [{linkedProject}]
                </span>
              </div>
              <a
                href="#work"
                onClick={onClose}
                className="flex-none flex items-center gap-1 font-mono text-[0.6rem] text-acid/80 hover:text-acid underline tracking-wider uppercase transition-colors"
              >
                <span>REEL VIEW</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="flex-none px-6 py-2 bg-[#141418] border-b border-[#27272A] flex items-center justify-between text-[#71717A] font-mono text-[0.6rem]">
              <span className="tracking-wider">STANDALONE CAMERA ARCHIVE // UNLINKED PLATE</span>
              <span className="text-[#52525B]">SENSOR ARCHIVAL DUMP</span>
            </div>
          )}

          {/* ── Scrollable Inspector Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto drawer-scroll px-6 py-5 space-y-6">

            {/* ── Section A: Dual Toggle & Visual Plate Preview ──────────── */}
            <div>
              {/* Toggle header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-acid" />
                  OPTICAL SENSOR VIEWPORT
                </span>

                {/* DUAL MODE TOGGLE BUTTON */}
                <div 
                  className="flex items-center p-1 rounded-md bg-[#08080A] border border-[#27272A] self-start sm:self-auto"
                  role="group"
                  aria-label="Plate View Mode"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('RAW')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[0.625rem] tracking-wider uppercase transition-all ${
                      viewMode === 'RAW'
                        ? 'bg-[#1C1C24] text-acid border border-acid/30 shadow-sm font-bold'
                        : 'text-[#71717A] hover:text-[#D4D4D8]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'RAW' ? 'bg-acid shadow-acid-glow' : 'bg-[#3F3F46]'}`} />
                    <span>Inspect Base RAW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('PROCESSED')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[0.625rem] tracking-wider uppercase transition-all ${
                      viewMode === 'PROCESSED'
                        ? 'bg-[#1C1C24] text-white border border-[#3F3F46] shadow-sm font-bold'
                        : 'text-[#71717A] hover:text-[#D4D4D8]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'PROCESSED' ? 'bg-[#FF3B30] shadow-tally-glow' : 'bg-[#3F3F46]'}`} />
                    <span>View Processed Frame</span>
                  </button>
                </div>
              </div>

              {/* Viewport Frame with Negative/Camera styling */}
              <div className="relative rounded bg-[#070709] border border-[#27272A] p-2 overflow-hidden shadow-inner">
                {/* Film frame corner guides */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/20 pointer-events-none z-10" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/20 pointer-events-none z-10" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/20 pointer-events-none z-10" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/20 pointer-events-none z-10" />

                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20">
                  <div className="w-6 h-px bg-white" />
                  <div className="h-6 w-px bg-white absolute" />
                </div>

                {/* Active Mode Banner Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  {viewMode === 'RAW' ? (
                    <span className="px-2.5 py-1 rounded bg-[#08080A]/90 border border-acid/40 text-acid font-mono text-[0.5625rem] tracking-widest font-semibold backdrop-blur-md uppercase">
                      ⦿ SENSOR READOUT // FLAT LOG PROFILE (UNPROCESSED)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-[#08080A]/90 border border-[#27272A] text-white font-mono text-[0.5625rem] tracking-widest font-semibold backdrop-blur-md uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                      MASTER GRADE // ACES P3-D65 TRANSFORM
                    </span>
                  )}
                </div>

                {/* Image Display */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-black">
                  <motion.img
                    key={`${item.id}-${viewMode}`}
                    initial={{ opacity: 0.5, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={currentImage}
                    alt={`${title} - ${viewMode}`}
                    className={`w-full h-full object-cover select-none ${viewMode === 'RAW' ? 'raw-log-plate' : ''}`}
                  />

                  {/* RAW mode subtle sensor grid watermark */}
                  {viewMode === 'RAW' && (
                    <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none mix-blend-overlay" />
                  )}
                </div>

                {/* Sub-bar on image viewport */}
                <div className="mt-2 pt-2 px-1 flex flex-wrap items-center justify-between text-[#71717A] font-mono text-[0.6rem] gap-2 border-t border-[#1C1C22]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#A1A1AA] font-bold">{title}</span>
                    <span className="text-[#3F3F46]">·</span>
                    <span className="flex items-center gap-1 text-[#71717A]">
                      <MapPin className="w-3 h-3 text-[#52525B]" />
                      {location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-acid">{exif.resolution}</span>
                    <span className="text-[#3F3F46]">·</span>
                    <span className="text-white font-bold">{fileSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section B: Technical EXIF Readouts (Core Requirement) ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-acid" />
                  TECHNICAL EXIF DATA // READOUTS
                </span>
                <span className="font-mono text-[0.5625rem] text-[#52525B]">
                  PARSED FROM {fileFormat || 'RAW FILE'}
                </span>
              </div>

              {/* 8-Grid High-Density Telemetry Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* 1. Camera Body */}
                <ExifMetricCell 
                  label="CAMERA BODY" 
                  value={exif.camera} 
                  highlight={true} 
                  accent="acid"
                />

                {/* 2. Lens Model */}
                <ExifMetricCell 
                  label="LENS" 
                  value={exif.lens} 
                />

                {/* 3. Focal Length */}
                <ExifMetricCell 
                  label="FOCAL LENGTH" 
                  value={exif.focalLength} 
                  sub="Full-frame eq."
                />

                {/* 4. Aperture */}
                <ExifMetricCell 
                  label="APERTURE" 
                  value={exif.aperture} 
                  highlight={true}
                />

                {/* 5. Shutter Speed */}
                <ExifMetricCell 
                  label="SHUTTER" 
                  value={exif.shutterSpeed} 
                />

                {/* 6. ISO Sensitivity */}
                <ExifMetricCell 
                  label="ISO SENSITIVITY" 
                  value={`ISO ${exif.iso}`} 
                  highlight={true}
                  accent={exif.iso > 800 ? 'tally' : 'acid'}
                />

                {/* 7. File Size */}
                <ExifMetricCell 
                  label="RAW FILE SIZE" 
                  value={fileSize} 
                  sub={fileFormat}
                />

                {/* 8. Color Profile */}
                <ExifMetricCell 
                  label="COLOR PROFILE" 
                  value={exif.colorProfile} 
                />

                {/* 9. White Balance */}
                <ExifMetricCell 
                  label="WHITE BALANCE" 
                  value={exif.whiteBalance} 
                />

                {/* 10. Native Resolution */}
                <ExifMetricCell 
                  label="RESOLUTION" 
                  value={exif.resolution} 
                />

                {/* 11. Bit Depth */}
                <ExifMetricCell 
                  label="BIT DEPTH" 
                  value={exif.bitDepth} 
                />

                {/* 12. Timestamp */}
                <ExifMetricCell 
                  label="CAPTURED AT" 
                  value={exif.capturedAt} 
                />
              </div>
            </div>

            {/* ── Section C: RGB Channel Histogram & Signal Telemetry ────── */}
            <div className="p-4 rounded bg-[#111116] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between text-[#71717A] font-mono text-[0.625rem]">
                <span className="tracking-widest uppercase flex items-center gap-1.5 text-white">
                  <Activity className="w-3 h-3 text-acid" />
                  DYNAMIC EXPOSURE HISTOGRAM // RGB DISTRIBUTION
                </span>
                <span className="text-[#52525B]">
                  MODE: {viewMode === 'RAW' ? 'LOG RAW (LINEAR)' : 'GRADED REC.709'}
                </span>
              </div>

              {/* Animated RGB Histogram Bars */}
              <div className="h-16 w-full flex items-end gap-1 bg-[#08080A] p-2 rounded border border-[#1E1E24]">
                {generateHistogramData(viewMode).map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                    {/* R channel */}
                    <div 
                      className="w-full bg-[#FF3B30] opacity-80 rounded-t-[1px] transition-all duration-300" 
                      style={{ height: `${bar.r}%` }}
                    />
                    {/* G channel */}
                    <div 
                      className="w-full bg-acid opacity-80 transition-all duration-300" 
                      style={{ height: `${bar.g}%` }}
                    />
                    {/* B channel */}
                    <div 
                      className="w-full bg-cyan-400 opacity-80 rounded-b-[1px] transition-all duration-300" 
                      style={{ height: `${bar.b}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between font-mono text-[0.5625rem] text-[#71717A]">
                <span>BLACKS: 0.0 IRE</span>
                <span>MIDTONES: 42 IRE (18% GRAY)</span>
                <span>CLIPPING: 100 IRE</span>
              </div>
            </div>

            {/* ── Section D: Directory Reference & Quick Copy ───────────── */}
            <div className="p-3.5 rounded bg-[#0A0A0D] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[0.625rem]">
              <div className="flex items-center gap-2 text-[#A1A1AA] truncate">
                <Folder className="w-3.5 h-3.5 text-acid flex-none" />
                <span className="text-[#71717A]">PATH:</span>
                <span className="text-white truncate">{folder?.path || '/DCIM/'}{frameIndex}</span>
              </div>

              <button
                type="button"
                onClick={copyPath}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16161D] border border-[#27272A] text-acid hover:border-acid/40 transition-colors uppercase tracking-wider flex-none"
              >
                {copiedFormat ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-acid" />
                    <span>COPIED PATH</span>
                  </>
                ) : (
                  <span>COPY PATH</span>
                )}
              </button>
            </div>

          </div>

          {/* ── Drawer Footer ─────────────────────────────────────────────── */}
          <div className="flex-none px-6 py-3.5 border-t border-[#27272A] bg-[#111115] flex items-center justify-between text-[#71717A] font-mono text-[0.625rem]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-acid" />
              <span>COLOUR SCIENCE ENGINE: ACEScc v1.3</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[#52525B]">NAV: USE [←] [→] KEYS</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded bg-[#1C1C24] text-white hover:bg-acid hover:text-black transition-colors uppercase tracking-wider font-semibold"
              >
                DISMISS
              </button>
            </div>
          </div>

        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExifMetricCell
// Micro-component for high-density EXIF parameters
// ─────────────────────────────────────────────────────────────────────────────
function ExifMetricCell({ label, value, highlight = false, accent = 'white', sub = null }) {
  const accentClass = 
    accent === 'acid' ? 'text-acid font-bold' : 
    accent === 'tally' ? 'text-tally font-bold' : 
    highlight ? 'text-white font-semibold' : 'text-[#D4D4D8]';

  return (
    <div className="p-3 rounded bg-[#111116] border border-[#27272A] flex flex-col justify-between transition-colors hover:border-[#3F3F46]">
      <span className="font-mono text-[0.5625rem] text-[#71717A] tracking-widest uppercase truncate block mb-1">
        {label}
      </span>
      <span className={`font-mono text-[0.75rem] tracking-wide truncate ${accentClass}`} title={value}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[0.5rem] text-[#52525B] tracking-wider truncate mt-0.5">
          {sub}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Histogram sample generator: distinct distribution curve for RAW vs Graded
// ─────────────────────────────────────────────────────────────────────────────
function generateHistogramData(mode) {
  if (mode === 'RAW') {
    // RAW log curve is concentrated towards lower-mids with soft roll-off
    return [
      { r: 12, g: 15, b: 20 },
      { r: 24, g: 30, b: 35 },
      { r: 42, g: 50, b: 58 },
      { r: 68, g: 75, b: 72 },
      { r: 85, g: 90, b: 88 },
      { r: 76, g: 82, b: 80 },
      { r: 52, g: 58, b: 54 },
      { r: 35, g: 38, b: 36 },
      { r: 20, g: 22, b: 18 },
      { r: 10, g: 12, b: 9 },
      { r: 6, g: 8, b: 5 },
      { r: 3, g: 4, b: 2 },
    ];
  }
  // Processed frame has higher contrast, expanded highlights, deep blacks
  return [
    { r: 28, g: 18, b: 35 },
    { r: 15, g: 12, b: 22 },
    { r: 30, g: 38, b: 40 },
    { r: 45, g: 52, b: 55 },
    { r: 65, g: 70, b: 68 },
    { r: 72, g: 68, b: 74 },
    { r: 88, g: 84, b: 78 },
    { r: 94, g: 88, b: 80 },
    { r: 70, g: 75, b: 82 },
    { r: 45, g: 50, b: 62 },
    { r: 28, g: 32, b: 44 },
    { r: 18, g: 20, b: 25 },
  ];
}
