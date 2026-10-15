import Masthead from './components/Masthead';
import HeroSection from './components/HeroSection';
import ProjectReelGrid from './components/ProjectReelGrid';
import RawVault from './components/RawVault';

export default function App() {
  return (
    <div className="grain min-h-screen" style={{ background: '#08080A' }}>
      <Masthead />

      <main>
        <HeroSection />

        {/* ─── Dynamic Edits Deck ──────────────────────────────── */}
        <div style={{ borderTop: '1px solid #27272A' }}>
          <ProjectReelGrid />
        </div>

        {/* ─── The RAW Vault ───────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #27272A' }}>
          <RawVault />
        </div>
      </main>
    </div>
  );
}
