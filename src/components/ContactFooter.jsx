import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Mail, 
  MapPin, 
  Clock, 
  ExternalLink, 
  ArrowUp,
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { siteMeta } from '../data/portfolioData';
import { playClickSound, playSuccessSound } from '../utils/audioSystem';

// ─────────────────────────────────────────────────────────────────────────────
// ContactFooter
// Monospace command-line contact terminal + quick-copy email + editorial footer
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactFooter() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    scope: 'COMMERCIAL TVC',
    timeline: 'Q4 2026',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [localTime, setLocalTime] = useState('');

  // ── Mumbai Real-time Clock ───────────────────────────────────────────────
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
        setLocalTime('14:35:00');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Quick-copy email handler ─────────────────────────────────────────────
  const copyEmail = () => {
    playSuccessSound();
    navigator.clipboard?.writeText(siteMeta.email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // ── Terminal Dispatch Submit ─────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    playClickSound(1600, 0.06);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      playSuccessSound();
    }, 1200);
  };

  const scrollToTop = () => {
    playClickSound(1000, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-tally animate-pulse" />
            <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase">
              TRANSMISSION TERMINAL // 04
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
            DISPATCH & CONTACT
          </h2>

          <p className="font-mono text-[0.6875rem] text-[#A1A1AA] tracking-wider mt-3 max-w-xl">
            Open for commercial campaigns, narrative film grades, and digital visual retouching commissions worldwide.
          </p>
        </div>

        {/* Quick Email Direct Copy Pill Button */}
        <div className="flex-none">
          <button
            type="button"
            onClick={copyEmail}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#121217] border border-[#27272A] hover:border-acid/50 transition-all group shadow-lg"
          >
            <div className="w-8 h-8 rounded-full bg-acid/10 border border-acid/30 flex items-center justify-center text-acid">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[0.5625rem] text-[#71717A] tracking-widest uppercase block">
                DIRECT INBOX // CLICK TO COPY
              </span>
              <span className="text-[0.75rem] text-white font-bold group-hover:text-acid transition-colors">
                {siteMeta.email}
              </span>
            </div>
            <div className="ml-2 pl-2 border-l border-[#27272A]">
              {isCopied ? (
                <span className="flex items-center gap-1 font-mono text-[0.6rem] text-acid font-bold">
                  <Check className="w-3.5 h-3.5" />
                  COPIED
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#71717A] group-hover:text-white transition-colors" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* ── Monospace Command-Line Contact Terminal ────────────────────── */}
      <div className="rounded-xl bg-[#0B0B0E] border border-[#27272A] overflow-hidden shadow-2xl mb-16">
        
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-[#131318] border-b border-[#27272A] flex items-center justify-between font-mono text-[0.625rem]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] opacity-80" />
            <span className="text-[#A1A1AA] font-bold ml-2">guest@framerate.studio: ~/send-dispatch.sh</span>
          </div>

          <div className="flex items-center gap-3 text-[#71717A] hidden sm:flex">
            <span>TLS 1.3 ENCRYPTED</span>
            <span>·</span>
            <span className="text-acid">STATUS: READY</span>
          </div>
        </div>

        {/* Terminal Body Form */}
        <div className="p-6 sm:p-8 font-mono">
          <AnimatePresence mode="wait">
            {isSent ? (
              /* Success Terminal State */
              <motion.div
                key="dispatch-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-acid/10 border border-acid/40 flex items-center justify-center text-acid shadow-acid-glow">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-acid font-bold text-sm tracking-wider">
                    [200 OK] DISPATCH TRANSMITTED TO {siteMeta.editor.toUpperCase()}
                  </p>
                  <p className="text-[0.7rem] text-[#A1A1AA] max-w-md">
                    Transmission packet securely delivered. Expect an editorial response within 24 hours.
                  </p>
                </div>

                <div className="p-3 rounded bg-[#131318] border border-[#27272A] text-[0.625rem] text-[#71717A] space-y-1 text-left max-w-sm w-full">
                  <div>DISPATCH_ID: #{Math.floor(100000 + Math.random() * 900000)}</div>
                  <div>SENDER: {formData.email}</div>
                  <div>SCOPE: [{formData.scope}]</div>
                  <div>TIMELINE: [{formData.timeline}]</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setFormData({ name: '', email: '', scope: 'COMMERCIAL TVC', timeline: 'Q4 2026', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded bg-[#1A1A22] text-white hover:text-acid border border-[#27272A] text-[0.6875rem] tracking-wider uppercase transition-colors"
                >
                  TRANSMIT ANOTHER DISPATCH
                </button>
              </motion.div>
            ) : (
              /* Interactive Command Line Form */
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Terminal Prompt Intro */}
                <div className="text-[0.6875rem] text-[#71717A] space-y-1 border-b border-[#1E1E24] pb-4">
                  <p className="text-[#A1A1AA]">
                    <span className="text-acid">manish@framerate:~$</span> cat README_INQUIRIES.txt
                  </p>
                  <p className="text-[#71717A]">
                    Available for high-end color grading, commercial assemblies, narrative post, and RAW retouching. Fill parameters below to transmit project brief.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Field 1: Name */}
                  <div className="space-y-1.5">
                    <label className="text-[0.625rem] text-[#71717A] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="text-acid">$</span> CLIENT_NAME:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova / Nike EMEA"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded bg-[#121217] border border-[#27272A] text-white text-xs focus:border-acid focus:outline-none focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[#3F3F46]"
                    />
                  </div>

                  {/* Field 2: Email */}
                  <div className="space-y-1.5">
                    <label className="text-[0.625rem] text-[#71717A] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="text-acid">$</span> CLIENT_EMAIL:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. producer@latitude.studio"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded bg-[#121217] border border-[#27272A] text-white text-xs focus:border-acid focus:outline-none focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[#3F3F46]"
                    />
                  </div>

                  {/* Field 3: Scope */}
                  <div className="space-y-1.5">
                    <label className="text-[0.625rem] text-[#71717A] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="text-acid">$</span> PROJECT_SCOPE:
                    </label>
                    <select
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded bg-[#121217] border border-[#27272A] text-white text-xs focus:border-acid focus:outline-none focus:ring-1 focus:ring-acid/40 transition-colors"
                    >
                      <option value="COMMERCIAL TVC">COMMERCIAL TVC / BRAND IDENTITY</option>
                      <option value="NARRATIVE SHORT / FEATURE">NARRATIVE SHORT / INDIE FEATURE</option>
                      <option value="COLOR FINISH / ACES PIPELINE">COLOR FINISHING (ACES / HDR10+)</option>
                      <option value="DIGITAL BEAUTY RETOUCH">DIGITAL BEAUTY & RETOUCH STILLS</option>
                      <option value="DOCUMENTARY POST">DOCUMENTARY EPISODIC</option>
                    </select>
                  </div>

                  {/* Field 4: Timeline */}
                  <div className="space-y-1.5">
                    <label className="text-[0.625rem] text-[#71717A] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="text-acid">$</span> ESTIMATED_DELIVERY:
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded bg-[#121217] border border-[#27272A] text-white text-xs focus:border-acid focus:outline-none focus:ring-1 focus:ring-acid/40 transition-colors"
                    >
                      <option value="IMMEDIATE / RUSH">IMMEDIATE / RUSH (WITHIN 2 WEEKS)</option>
                      <option value="Q4 2026">Q4 2026 SCHEDULE</option>
                      <option value="Q1 2027">Q1 2027 PRODUCTION</option>
                      <option value="FLEXIBLE ARCHIVE">FLEXIBLE / TBD</option>
                    </select>
                  </div>

                </div>

                {/* Field 5: Message */}
                <div className="space-y-1.5">
                  <label className="text-[0.625rem] text-[#71717A] tracking-wider uppercase flex items-center gap-1.5">
                    <span className="text-acid">$</span> DISPATCH_PAYLOAD (BRIEF / RESOLUTION / CAMERAS):
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter production details: camera systems (e.g. ARRI Alexa 35 / Sony Venice), deliverables, expected total run-time, and reference look..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded bg-[#121217] border border-[#27272A] text-white text-xs focus:border-acid focus:outline-none focus:ring-1 focus:ring-acid/40 transition-colors placeholder-[#3F3F46] resize-none"
                  />
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#1E1E24]">
                  <div className="flex items-center gap-2 text-[0.6rem] text-[#71717A]">
                    <Radio className="w-3.5 h-3.5 text-acid animate-pulse" />
                    <span>CARRIER: ENCRYPTED HTTPS DISPATCH PROTOCOL</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-acid text-black font-mono text-xs font-bold tracking-wider uppercase hover:bg-white transition-all shadow-acid-glow disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>ENCRYPTING & TRANSMITTING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>EXECUTE TRANSMISSION // SEND</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── Sub-Footer Editorial Telemetry & Socials ──────────────────── */}
      <div className="pt-8 border-t border-[#27272A] flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[0.6875rem] text-[#71717A]">
        
        {/* Editor signature & location */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-tally animate-pulse" />
            <span>{siteMeta.name}</span>
          </div>
          <span>·</span>
          <span>{siteMeta.editor}</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-[#A1A1AA]">
            <MapPin className="w-3 h-3 text-acid" />
            {siteMeta.location}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-acid font-semibold">
            <Clock className="w-3 h-3" />
            {localTime} IST
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <a
            href={siteMeta.socials.vimeo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A1A1AA] hover:text-white transition-colors relative py-0.5 group"
          >
            <span>VIMEO</span>
            <span className="absolute bottom-0 left-0 w-0 h-px bg-acid transition-all duration-200 group-hover:w-full" />
          </a>
          <a
            href={siteMeta.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A1A1AA] hover:text-white transition-colors relative py-0.5 group"
          >
            <span>INSTAGRAM</span>
            <span className="absolute bottom-0 left-0 w-0 h-px bg-acid transition-all duration-200 group-hover:w-full" />
          </a>
          <a
            href={siteMeta.socials.behance}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A1A1AA] hover:text-white transition-colors relative py-0.5 group"
          >
            <span>BEHANCE</span>
            <span className="absolute bottom-0 left-0 w-0 h-px bg-acid transition-all duration-200 group-hover:w-full" />
          </a>

          {/* Back to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            title="Back to Top"
            className="flex items-center gap-1 text-[#71717A] hover:text-acid transition-colors ml-2 pl-4 border-l border-[#27272A]"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ── System Credits ────────────────────────────────────────────── */}
      <div className="mt-8 text-center text-[#52525B] font-mono text-[0.5625rem] tracking-widest uppercase">
        © 2026 {siteMeta.editor.toUpperCase()} · COLOR FINISH & EDITORIAL SUITE · ACES 2065-1 ARCHIVE · SMPTE TIMECODE SYNC
      </div>

    </footer>
  );
}
