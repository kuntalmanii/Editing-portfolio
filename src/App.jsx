import Masthead from './components/Masthead';
import HeroSection from './components/HeroSection';
import ProjectReelGrid from './components/ProjectReelGrid';
import ColorLabSuite from './components/ColorLabSuite';
import RawVault from './components/RawVault';
import TimelineResume from './components/TimelineResume';
import ContactFooter from './components/ContactFooter';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <div className="grain min-h-screen relative transition-colors duration-300 overflow-x-hidden" style={{ color: 'var(--c-text)' }}>
      {/* Full-Length Dynamic Studio Background Canvas */}
      <div className="full-site-grid fixed inset-0 pointer-events-none z-0" />
      <div className="full-site-atmosphere absolute inset-0 pointer-events-none z-0" />

      {/* Precision custom cursor follower */}
      <CustomCursor />

      {/* Fixed Telemetry Masthead */}
      <Masthead />

      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection />

        {/* ─── Dynamic Edits Deck ──────────────────────────────── */}
        <ProjectReelGrid />

        {/* ─── DaVinci Interactive Color Grading Suite ─────────── */}
        <ColorLabSuite />

        {/* ─── The RAW Vault ───────────────────────────────────── */}
        <RawVault />

        {/* ─── NLE Timeline Resume ─────────────────────────────── */}
        <TimelineResume />
      </main>

      {/* ─── Command-Line Contact & System Footer ──────────────── */}
      <div className="relative z-10">
        <ContactFooter />
      </div>
    </div>
  );
}
