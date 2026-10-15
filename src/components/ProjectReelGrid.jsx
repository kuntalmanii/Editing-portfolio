import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Play, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { videoProjects, FILTER_TABS } from '../data/portfolioData';
import ProjectModal from './ProjectModal';

// ─────────────────────────────────────────────────────────────────────────────
// ProjectReelGrid
// Filter bar → animated card grid → modal on click
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectReelGrid() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = activeFilter === 'ALL'
    ? videoProjects
    : videoProjects.filter((p) => p.category === activeFilter);

  return (
    <section id="work" className="relative py-20 px-5 md:px-8 max-w-7xl mx-auto">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
        <div>
          <p className="section-label mb-3 flex items-center gap-3">
            <span className="block w-8 h-px bg-border" />
            Dynamic Edits Deck
          </p>
          <h2
            className="font-display font-extrabold text-text"
            style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            SELECTED WORK
          </h2>
        </div>
        <p className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.06em', color: '#52525B' }}>
          {filtered.length} / {videoProjects.length} projects
        </p>
      </div>

      {/* ── Filter pill bar ────────────────────────────────────────────── */}
      <LayoutGroup id="filter">
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTER_TABS.map((tab) => (
            <FilterPill
              key={tab}
              label={tab}
              active={activeFilter === tab}
              count={tab === 'ALL' ? videoProjects.length : videoProjects.filter(p => p.category === tab).length}
              onClick={() => setActiveFilter(tab)}
            />
          ))}
        </div>
      </LayoutGroup>

      {/* ── Project grid ───────────────────────────────────────────────── */}
      <LayoutGroup id="grid">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                onOpen={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* ── Project modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterPill
// ─────────────────────────────────────────────────────────────────────────────
function FilterPill({ label, active, count, onClick }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex items-center gap-2 px-3.5 py-1.5 font-mono uppercase rounded-full transition-all duration-200"
      style={{
        fontSize: '0.6rem',
        letterSpacing: '0.16em',
        border: active ? '1px solid rgba(226,249,82,0.5)' : '1px solid #27272A',
        background: active ? 'rgba(226,249,82,0.07)' : 'transparent',
        color: active ? '#E2F952' : '#52525B',
      }}
    >
      {active && (
        <motion.span
          layoutId="filter-pip"
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: '#E2F952', boxShadow: '0 0 6px rgba(226,249,82,0.6)' }}
        />
      )}
      {label}
      <span style={{ opacity: 0.45, fontSize: '0.5rem' }}>{count}</span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProjectCard
// Hover → seamless video preview loop; click → modal
// ─────────────────────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onOpen }) {
  const videoRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const handlePointerEnter = useCallback(() => {
    setHovering(true);
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHovering(false);
    const vid = videoRef.current;
    if (vid) {
      vid.pause();
      // Fade back to poster
      setTimeout(() => {
        if (videoRef.current) videoRef.current.currentTime = 0;
      }, 350);
    }
  }, []);

  const CARD = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.25 } },
  };

  // Category color
  const catColor = {
    COMMERCIAL: '#E2F952',
    DOCUMENTARY: '#60A5FA',
    EDITORIAL: '#A78BFA',
    NARRATIVE: '#FB923C',
  }[project.category] ?? '#A1A1AA';

  return (
    <motion.article
      layout
      variants={CARD}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative cursor-pointer"
      style={{ background: '#111114', border: '1px solid #27272A', borderRadius: 2, overflow: 'hidden' }}
      onClick={onOpen}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* ── Thumbnail / video area ───────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {/* Static poster */}
        <img
          src={project.coverImage}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: 'opacity 0.4s ease, transform 0.6s ease',
            opacity: hovering && videoReady ? 0 : 1,
            transform: hovering ? 'scale(1.04)' : 'scale(1)',
          }}
          loading="lazy"
        />

        {/* Hover video preview */}
        <video
          ref={videoRef}
          src={project.videoPreviewUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted loop playsInline preload="none"
          style={{
            opacity: hovering && videoReady ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          onCanPlay={() => setVideoReady(true)}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.1) 50%, transparent 100%)' }}
        />

        {/* Top-left category badge */}
        <div
          className="absolute top-3 left-3 font-mono uppercase px-2 py-0.5"
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.18em',
            color: catColor,
            border: `1px solid ${catColor}33`,
            background: 'rgba(8,8,10,0.75)',
            borderRadius: 1,
          }}
        >
          {project.category}
        </div>

        {/* Top-right: year */}
        <div
          className="absolute top-3 right-3 font-mono"
          style={{ fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}
        >
          {project.year}
        </div>

        {/* Play icon pulse */}
        <AnimatePresence>
          {hovering && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(8,8,10,0.55)', backdropFilter: 'blur(4px)' }}
              >
                <Play size={14} style={{ color: '#fff', marginLeft: 2 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom runtime badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <Clock size={9} style={{ color: '#71717A' }} />
          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: '#71717A' }}>
            {project.runTime}
          </span>
        </div>

        {/* Inspect arrow — appears on hover */}
        <motion.div
          className="absolute bottom-3 right-3 flex items-center gap-1 font-mono uppercase"
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: hovering ? 1 : 0, x: hovering ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.5rem', letterSpacing: '0.16em', color: '#E2F952', pointerEvents: 'none' }}
        >
          INSPECT <ChevronRight size={8} />
        </motion.div>
      </div>

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div className="px-4 py-4">
        <h3
          className="font-display font-bold text-text"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.1 }}
        >
          {project.title}
        </h3>
        <p className="font-mono mt-0.5" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: '#52525B' }}>
          {project.subtitle}
        </p>

        {/* Divider */}
        <div className="my-3" style={{ height: '1px', background: '#27272A' }} />

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MetaChip label="CLIENT" value={project.client} />
            <span style={{ color: '#27272A' }}>·</span>
            <MetaChip label="COLOUR" value={project.colorSpace} />
          </div>
          {/* Hover CTA */}
          <motion.div
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1"
            style={{ color: '#E2F952' }}
          >
            <ExternalLink size={10} />
          </motion.div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.map((t) => (
            <span
              key={t}
              className="font-mono uppercase"
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.12em',
                color: '#3F3F46',
                border: '1px solid #27272A',
                padding: '2px 7px',
                borderRadius: 1,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-sm pointer-events-none"
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ border: '1px solid rgba(226,249,82,0.15)', boxShadow: 'inset 0 0 20px rgba(226,249,82,0.03)' }}
      />
    </motion.article>
  );
}

function MetaChip({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono uppercase" style={{ fontSize: '0.45rem', letterSpacing: '0.18em', color: '#3F3F46' }}>
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.04em', color: '#71717A' }}>
        {value}
      </span>
    </div>
  );
}
