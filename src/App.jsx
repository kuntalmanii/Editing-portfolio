import Masthead from './components/Masthead';
import HeroSection from './components/HeroSection';
import ProjectReelGrid from './components/ProjectReelGrid';

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

        {/* Phase 3+ sections appended here */}
      </main>
    </div>
  );
}
