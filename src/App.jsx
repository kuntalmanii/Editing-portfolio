import Masthead from './components/Masthead';
import HeroSection from './components/HeroSection';
import ProjectReelGrid from './components/ProjectReelGrid';
import RawVault from './components/RawVault';
import TimelineResume from './components/TimelineResume';
import ContactFooter from './components/ContactFooter';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <div className="grain min-h-screen relative" style={{ background: '#08080A' }}>
      {/* Precision custom cursor follower */}
      <CustomCursor />

      {/* Fixed Telemetry Masthead */}
      <Masthead />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* ─── Dynamic Edits Deck ──────────────────────────────── */}
        <div style={{ borderTop: '1px solid #27272A' }}>
          <ProjectReelGrid />
        </div>

        {/* ─── The RAW Vault ───────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #27272A' }}>
          <RawVault />
        </div>

        {/* ─── NLE Timeline Resume ─────────────────────────────── */}
        <div style={{ borderTop: '1px solid #27272A' }}>
          <TimelineResume />
        </div>
      </main>

      {/* ─── Command-Line Contact & System Footer ──────────────── */}
      <div style={{ borderTop: '1px solid #27272A' }}>
        <ContactFooter />
      </div>
    </div>
  );
}
