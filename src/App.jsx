import Masthead from './components/Masthead';
import HeroSection from './components/HeroSection';

export default function App() {
  return (
    <div className="grain min-h-screen" style={{ background: '#08080A' }}>
      <Masthead />
      <main>
        <HeroSection />
        {/* Phase 2+ sections will be added here */}
      </main>
    </div>
  );
}
