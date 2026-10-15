import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// BeforeAfterViewer
// Interactive split-screen grade comparison with draggable hairline divider.
// Props:
//   before      – URL of the flat/log/RAW plate image
//   after       – URL of the final colour-graded image
//   gradeSpecs  – { baseProfile, nodes, lutApplied, colorTransform, primaryGrade, noiseReduction }
//   project     – partial project object for labelling
// ─────────────────────────────────────────────────────────────────────────────

export default function BeforeAfterViewer({ before, after, gradeSpecs, project }) {
  const [splitPct, setSplitPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // Hide slide hint after first interaction
  const dismissHint = useCallback(() => setHintVisible(false), []);

  // ── Compute split from pointer position ──────────────────────────────────
  const computeSplit = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(95, Math.max(5, raw)));
  }, []);

  // ── Mouse events ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    dismissHint();
    computeSplit(e.clientX);
  }, [computeSplit, dismissHint]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => computeSplit(e.clientX));
  }, [isDragging, computeSplit]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  // ── Touch events ─────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    setIsDragging(true);
    dismissHint();
    computeSplit(e.touches[0].clientX);
  }, [computeSplit, dismissHint]);

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => computeSplit(e.touches[0].clientX));
  }, [isDragging, computeSplit]);

  const onTouchEnd = useCallback(() => setIsDragging(false), []);

  // ── Global up / cancel ───────────────────────────────────────────────────
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  return (
    <div className="flex flex-col lg:flex-row gap-0 w-full" style={{ background: '#08080A' }}>

      {/* ── Split-screen viewer ──────────────────────────────────────────── */}
      <div
        ref={containerRef}
        data-cursor="DRAG"
        className="relative overflow-hidden flex-1 split-slider-container"
        style={{
          aspectRatio: '16/9',
          cursor: isDragging ? 'grabbing' : 'col-resize',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          minHeight: 240,
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* AFTER (graded) — full width, clipped from right */}
        <img
          src={after}
          alt="Colour graded"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: 'none' }}
        />

        {/* BEFORE (flat log) — clipped to left side */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${splitPct}%` }}
        >
          <img
            src={before}
            alt="Flat log plate"
            draggable={false}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: `${(100 / splitPct) * 100}%`,
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              filter: 'saturate(0.35) brightness(1.05)',
            }}
          />
          {/* LOG label */}
          <div
            className="absolute top-3 left-3 font-mono uppercase"
            style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: 1 }}
          >
            RAW · LOG PLATE
          </div>
        </div>

        {/* GRADED label */}
        <div
          className="absolute top-3 right-3 font-mono uppercase"
          style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(226,249,82,0.85)', background: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: 1 }}
        >
          FINAL GRADE
        </div>

        {/* ── Hairline divider ──────────────────────────────────────────── */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center"
          style={{
            left: `${splitPct}%`,
            transform: 'translateX(-50%)',
            width: 2,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Top line */}
          <div className="flex-1 w-px" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }} />

          {/* Central handle */}
          <div
            className="flex items-center gap-1 px-2 py-1 font-mono"
            style={{
              background: 'rgba(8,8,10,0.9)',
              border: '1px solid rgba(226,249,82,0.5)',
              boxShadow: '0 0 12px rgba(226,249,82,0.25)',
              fontSize: '0.5rem',
              letterSpacing: '0.12em',
              color: '#E2F952',
              whiteSpace: 'nowrap',
              borderRadius: 2,
              cursor: isDragging ? 'grabbing' : 'grab',
              pointerEvents: 'all',
            }}
          >
            <span style={{ opacity: 0.6 }}>‹</span>
            <span>SLIDE</span>
            <span style={{ opacity: 0.6 }}>›</span>
          </div>

          {/* Bottom line */}
          <div className="flex-1 w-px" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }} />
        </div>

        {/* Drag gesture hint */}
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              style={{ zIndex: 20 }}
            >
              <motion.div
                animate={{ x: [0, -14, 14, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 1.2 }}
                className="font-mono uppercase flex items-center gap-2"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(8,8,10,0.75)',
                  padding: '6px 14px',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                ← DRAG TO COMPARE →
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split position readout */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono"
          style={{ fontSize: '0.5rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
        >
          {Math.round(splitPct)}% · {Math.round(100 - splitPct)}%
        </div>
      </div>

      {/* ── Grade specs side panel ───────────────────────────────────────── */}
      {gradeSpecs && (
        <motion.div
          layout
          className="flex-shrink-0 lg:w-72 xl:w-80 flex flex-col"
          style={{ background: 'var(--c-surface)', borderLeft: '1px solid var(--c-border)' }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
            <p className="font-mono uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--c-muted)' }}>
              COLOUR GRADE SPECS
            </p>
            {project?.title && (
              <p className="font-display font-bold mt-1" style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', letterSpacing: '0.04em', color: 'var(--c-text)' }}>
                {project.title}
              </p>
            )}
          </div>

          {/* Spec rows */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-4">
            {[
              { label: 'BASE PROFILE',     value: gradeSpecs.baseProfile },
              { label: 'NODE COUNT',        value: `${gradeSpecs.nodes} nodes` },
              { label: 'LUT APPLIED',       value: gradeSpecs.lutApplied, accent: true },
              { label: 'COLOUR TRANSFORM',  value: gradeSpecs.colorTransform },
              { label: 'PRIMARY GRADE',     value: gradeSpecs.primaryGrade },
              { label: 'NOISE / GRAIN',     value: gradeSpecs.noiseReduction },
            ].map(({ label, value, accent }) => (
              <SpecRow key={label} label={label} value={value} accent={accent} />
            ))}
          </div>

          {/* Node count visual bar */}
          <div className="px-5 pb-5">
            <p className="font-mono mb-2" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
              NODE PIPELINE
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(gradeSpecs.nodes, 32) }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm transition-colors"
                  style={{
                    width: 8, height: 8,
                    background: i < 3
                      ? '#E2F952'          // input nodes — acid
                      : i >= gradeSpecs.nodes - 1
                      ? '#FF3B30'          // output node — tally
                      : 'rgba(226,249,82,0.18)', // mid nodes
                  }}
                  title={`Node ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SpecRow({ label, value, accent }) {
  return (
    <div>
      <p className="font-mono" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: 'var(--c-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </p>
      <p className="font-mono font-medium" style={{ fontSize: '0.68rem', letterSpacing: '0.04em', color: accent ? 'var(--c-tally)' : 'var(--c-text)', lineHeight: 1.5 }}>
        {value}
      </p>
    </div>
  );
}
