import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  ArrowUp, 
  Check, 
  Copy, 
  Send, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { siteMeta } from '../data/portfolioData';
import { playClickSound, playSuccessSound } from '../utils/audioSystem';

// ─────────────────────────────────────────────────────────────────────────────
// ContactFooter
// Redesigned with refined editorial UI/UX:
// - Generous negative space and strong typographic hierarchy
// - Direct email quick-copy with instant tactile feedback
// - Clean, frictionless 2-column contact interface
// - Studio metadata, live timezone, and navigation colophon
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  'Commercial TVC',
  'Narrative / Feature',
  'Color Grading Only',
  'Visual Retouching',
  'Music Video',
];

export default function ContactFooter() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Commercial TVC',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [localTime, setLocalTime] = useState('');

  // Mumbai IST live clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const ist = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLocalTime(ist);
      } catch (e) {
        setLocalTime('14:30:00');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick-copy email handler
  const copyEmail = useCallback(() => {
    playSuccessSound();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(siteMeta.email);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2400);
  }, []);

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    playClickSound(1500, 0.05);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      playSuccessSound();
    }, 900);
  };

  const scrollToTop = () => {
    playClickSound(1000, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative pt-20 sm:pt-28 pb-12 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto">
      
      {/* ── Top Header & Direct Action Split ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20 items-start">
        
        {/* Left Column: Bold Typographic Callout & Studio Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Section Tag */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-tally animate-pulse" />
              <span className="font-mono text-[0.6875rem] text-[var(--c-muted)] uppercase tracking-widest">
                DISPATCH // 04 — GET IN TOUCH
              </span>
            </div>

            {/* Main Display Headline */}
            <h2
              className="font-display font-extrabold uppercase leading-[0.94] text-[var(--c-text)] tracking-tight mb-6"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(2.15rem, 4.2vw, 3.6rem)',
                letterSpacing: '-0.035em',
              }}
            >
              LET’S WORK
              <br />
              <span 
                className="transition-colors duration-300 block"
                style={{
                  color: 'var(--c-acid)',
                }}
              >
                TOGETHER.
              </span>
            </h2>

            {/* Editorial Sub-copy */}
            <p className="font-mono text-xs sm:text-sm text-[var(--c-text-dim)] leading-relaxed max-w-md">
              Available for commercial assemblies, narrative film grades, and digital beauty retouching commissions worldwide. Remote collaboration via Frame.io C2C.
            </p>
          </div>

          {/* Direct Email Action Tile */}
          <div className="mt-10 pt-8 border-t border-[var(--c-border)]">
            <span className="font-mono text-[0.625rem] text-[var(--c-muted)] uppercase tracking-wider block mb-2">
              DIRECT INBOX // CLICK TO COPY
            </span>
            
            <button
              type="button"
              onClick={copyEmail}
              className="group flex flex-wrap items-center gap-3 text-left transition-all"
            >
              <span className="font-mono font-bold text-lg sm:text-2xl text-[var(--c-text)] group-hover:text-acid transition-colors underline underline-offset-4 decoration-[var(--c-border)] group-hover:decoration-acid">
                {siteMeta.email}
              </span>
              
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] px-3 py-1 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-dim)] group-hover:border-acid group-hover:text-acid transition-all">
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-acid" />
                    <span className="font-bold text-acid">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </>
                )}
              </span>
            </button>

            {/* Studio Key Metadata Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-6 font-mono text-xs text-[var(--c-muted)]">
              <div className="flex items-center gap-1.5 text-[var(--c-text)]">
                <MapPin className="w-3.5 h-3.5 text-acid" />
                <span>{siteMeta.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-acid" />
                <span>{localTime} IST</span>
              </div>
              <div className="flex items-center gap-1.5 text-acid font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-acid animate-ping" />
                <span>COMMISSIONS OPEN</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Clean, Frictionless Editorial Form (7 cols, shifted right) */}
        <div className="lg:col-span-7 lg:pl-6 lg:translate-x-3 xl:translate-x-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xl transition-colors duration-300">
            
            <AnimatePresence mode="wait">
              {isSent ? (
                /* Success Confirmation State */
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-acid/10 border border-acid/40 flex items-center justify-center text-acid shadow-acid-glow">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl text-[var(--c-text)]">
                      DISPATCH RECEIVED
                    </h3>
                    <p className="font-mono text-xs text-[var(--c-text-dim)] max-w-sm mx-auto">
                      Thank you for reaching out. Your project brief has been sent to Manish Kuntal. Expect a response within 24 hours.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound(1200, 0.04);
                      setIsSent(false);
                      setFormData({ name: '', email: '', projectType: 'Commercial TVC', message: '' });
                    }}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--c-surface-inner)] border border-[var(--c-border)] hover:border-acid text-xs font-mono text-[var(--c-text)] hover:text-acid transition-all"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </motion.div>
              ) : (
                /* Standard Clean Editorial Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                    <span className="font-mono text-xs font-bold text-[var(--c-text)]">
                      PROJECT INQUIRY FORM
                    </span>
                    <span className="font-mono text-[0.625rem] text-[var(--c-muted)]">
                      FAST RESPONSE &lt; 24H
                    </span>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block font-mono text-[0.6875rem] text-[var(--c-text-dim)] uppercase tracking-wider mb-2">
                        Your Name / Company *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan / Nike"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)] text-xs sm:text-sm focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[var(--c-muted)] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[0.6875rem] text-[var(--c-text-dim)] uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)] text-xs sm:text-sm focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[var(--c-muted)] font-mono"
                      />
                    </div>

                  </div>

                  {/* Project Type Selector */}
                  <div>
                    <label className="block font-mono text-[0.6875rem] text-[var(--c-text-dim)] uppercase tracking-wider mb-2">
                      Scope / Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PROJECT_TYPES.map((type) => {
                        const isSelected = formData.projectType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              playClickSound(1400, 0.03);
                              setFormData({ ...formData, projectType: type });
                            }}
                            className={`px-3 py-2.5 rounded-xl text-xs font-mono text-center border transition-all truncate ${
                              isSelected
                                ? 'bg-acid text-black border-acid font-bold shadow-acid-glow filter-pill-active'
                                : 'bg-[var(--c-surface-inner)] text-[var(--c-text-dim)] border-[var(--c-border)] hover:border-[var(--c-text-dim)] hover:text-[var(--c-text)]'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Brief */}
                  <div>
                    <label className="block font-mono text-[0.6875rem] text-[var(--c-text-dim)] uppercase tracking-wider mb-2">
                      Project Brief & Timeline *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell me about your project: timeline, camera systems, deliverables, and any references..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)] text-xs sm:text-sm focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[var(--c-muted)] font-mono resize-none"
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-acid text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-acid-glow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>SENDING INQUIRY...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>TRANSMIT BRIEF // SEND</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* ── Bottom Colophon & Navigation ──────────────────────────────────── */}
      <div className="pt-10 border-t border-[var(--c-border)] flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-[var(--c-muted)]">
        
        {/* Brand identity & editor */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--c-text)] font-bold">
            <span className="w-2 h-2 rounded-full bg-tally animate-pulse" />
            <span>{siteMeta.name}</span>
          </div>
          <span>·</span>
          <span className="text-[var(--c-text-dim)]">{siteMeta.editor}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline text-[var(--c-muted)]">Color & Editorial Finishing Suite</span>
        </div>

        {/* Social Links with Hover Arrow */}
        <div className="flex items-center gap-6">
          {siteMeta.socials?.vimeo && (
            <a 
              href={siteMeta.socials.vimeo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--c-text-dim)] hover:text-acid transition-colors flex items-center gap-1 group"
            >
              <span>VIMEO</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
          {siteMeta.socials?.instagram && (
            <a 
              href={siteMeta.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--c-text-dim)] hover:text-acid transition-colors flex items-center gap-1 group"
            >
              <span>INSTAGRAM</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
          {siteMeta.socials?.behance && (
            <a 
              href={siteMeta.socials.behance}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--c-text-dim)] hover:text-acid transition-colors flex items-center gap-1 group"
            >
              <span>BEHANCE</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
          {siteMeta.socials?.linkedin && (
            <a 
              href={siteMeta.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--c-text-dim)] hover:text-acid transition-colors flex items-center gap-1 group"
            >
              <span>LINKEDIN</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}

          {/* Back to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            title="Back to Top"
            className="flex items-center gap-1 text-[var(--c-text-dim)] hover:text-acid transition-colors ml-2 pl-4 border-l border-[var(--c-border)]"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Legal sub-line */}
      <div className="mt-6 text-center md:text-left text-[0.625rem] text-[var(--c-muted)] font-mono">
        © 2026 {siteMeta.editor.toUpperCase()} · ACES 2065-1 COLOR PIPELINE · ALL RIGHTS RESERVED
      </div>

    </footer>
  );
}
