import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Activity, 
  Film, 
  Palette
} from 'lucide-react';
import { playClickSound, playSuccessSound, playSwitchSound } from '../utils/audioSystem';

// ─────────────────────────────────────────────────────────────────────────────
// Sample Cinema Shots for Grading
// ─────────────────────────────────────────────────────────────────────────────
const CINEMA_SHOTS = [
  {
    id: 'shot-01',
    name: 'SOLSTICE // GOLDEN HOUR',
    camera: 'ARRI Alexa Mini LF',
    lens: 'Cooke Anamorphic /i Full Frame Plus 40mm',
    iso: '800 EI',
    format: 'ARRIRAW 4.5K · 2.39:1',
    rawImage: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=1400&q=85',
    colorSpace: 'ARRI LogC3 → ACEScc',
  },
  {
    id: 'shot-02',
    name: 'NEO TOKYO // CYBER NIGHT',
    camera: 'Sony Venice II',
    lens: 'Zeiss Supreme Prime Radiance 50mm',
    iso: '3200 Dual Base',
    format: 'X-OCN XT · 16:9',
    rawImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=85',
    colorSpace: 'Sony S-Log3 → SGamut3.Cine',
  },
  {
    id: 'shot-03',
    name: 'DEEP BLUE // COASTAL SURF',
    camera: 'RED V-Raptor 8K VV',
    lens: 'Leica Summilux-C 29mm T1.4',
    iso: '640 ISO',
    format: 'REDCODE RAW 8K · 2.40:1',
    rawImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1400&q=85',
    colorSpace: 'REDWideGamutRGB / Log3G10',
  },
  {
    id: 'shot-04',
    name: 'URBAN VELOCITY // CAR DRIFT',
    camera: 'Blackmagic URSA 12K',
    lens: 'Canon K35 Vintage Prime 35mm',
    iso: '400 ISO',
    format: 'Blackmagic RAW 12K 3:1 · 2.39:1',
    rawImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85',
    colorSpace: 'Blackmagic Design Gen 5 Film',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Film Look & LUT Presets
// ─────────────────────────────────────────────────────────────────────────────
const LUT_PRESETS = [
  {
    id: 'kodak-2383',
    name: 'KODAK 2383',
    label: 'Hollywood Print Stock',
    lift: { x: -0.12, y: 0.15, level: -8 },    // cool cyan/teal shadow
    gamma: { x: 0.08, y: -0.06, level: 4 },    // warm amber skin
    gain: { x: 0.18, y: -0.14, level: 14 },    // golden highlight roll-off
    temp: 14,
    tint: -4,
    contrast: 1.28,
    saturation: 1.15,
  },
  {
    id: 'fuji-eterna',
    name: 'FUJI ETERNA',
    label: 'Soft Pastel Roll-off',
    lift: { x: -0.06, y: -0.04, level: 12 },   // lifted misty blacks
    gamma: { x: -0.08, y: 0.10, level: -2 },   // delicate olive mids
    gain: { x: 0.05, y: -0.08, level: -6 },    // soft diffused highlights
    temp: -6,
    tint: 8,
    contrast: 0.94,
    saturation: 0.88,
  },
  {
    id: 'teal-orange',
    name: 'TEAL & ORANGE',
    label: 'Blockbuster Separation',
    lift: { x: -0.28, y: 0.22, level: -12 },   // aggressive teal/cyan shadows
    gamma: { x: 0.16, y: -0.12, level: 6 },    // punchy saturated warm mids
    gain: { x: 0.26, y: -0.18, level: 18 },    // blazing warm highlights
    temp: 22,
    tint: -10,
    contrast: 1.35,
    saturation: 1.25,
  },
  {
    id: 'bleach-bypass',
    name: 'BLEACH BYPASS',
    label: 'Gritty Silver Emulsion',
    lift: { x: 0.02, y: -0.02, level: -18 },   // crushed dense blacks
    gamma: { x: 0.0, y: 0.0, level: 10 },      // desaturated silver mids
    gain: { x: 0.04, y: -0.02, level: 25 },    // blown specular retention
    temp: -10,
    tint: 4,
    contrast: 1.55,
    saturation: 0.55,
  },
  {
    id: 'neo-noir',
    name: 'NEO-NOIR MONO',
    label: 'Panchromatic B&W',
    lift: { x: 0.0, y: 0.0, level: -15 },
    gamma: { x: 0.0, y: 0.0, level: 2 },
    gain: { x: 0.0, y: 0.0, level: 20 },
    temp: 0,
    tint: 0,
    contrast: 1.45,
    saturation: 0.0,
  },
  {
    id: 'flat-raw',
    name: 'FLAT CAMERA RAW',
    label: 'Sensor Log Uncompressed',
    lift: { x: 0, y: 0, level: 0 },
    gamma: { x: 0, y: 0, level: 0 },
    gain: { x: 0, y: 0, level: 0 },
    temp: 0,
    tint: 0,
    contrast: 1.0,
    saturation: 1.0,
  },
];

export default function ColorLabSuite() {
  const [activeShot, setActiveShot] = useState(CINEMA_SHOTS[0]);
  const [activeLut, setActiveLut] = useState(LUT_PRESETS[0]);
  
  // ── Wheel States ───────────────────────────────────────────────────────────
  const [lift, setLift] = useState(LUT_PRESETS[0].lift);
  const [gamma, setGamma] = useState(LUT_PRESETS[0].gamma);
  const [gain, setGain] = useState(LUT_PRESETS[0].gain);

  // ── Sliders ────────────────────────────────────────────────────────────────
  const [temperature, setTemperature] = useState(LUT_PRESETS[0].temp);
  const [tint, setTint] = useState(LUT_PRESETS[0].tint);
  const [contrast, setContrast] = useState(LUT_PRESETS[0].contrast);
  const [saturation, setSaturation] = useState(LUT_PRESETS[0].saturation);
  const [filmGrain, setFilmGrain] = useState(true);

  // ── Interactive Split Wipe ─────────────────────────────────────────────────
  const [splitPct, setSplitPct] = useState(50);
  const [isWiping, setIsWiping] = useState(false);
  const wipeContainerRef = useRef(null);

  // ── Feedback states ────────────────────────────────────────────────────────
  const [copiedCDL, setCopiedCDL] = useState(false);

  // Apply a LUT preset smoothly
  const applyPreset = (preset) => {
    playSwitchSound();
    setActiveLut(preset);
    setLift({ ...preset.lift });
    setGamma({ ...preset.gamma });
    setGain({ ...preset.gain });
    setTemperature(preset.temp);
    setTint(preset.tint);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
  };

  // Reset to neutral flat Log
  const handleReset = () => {
    playClickSound(1000, 0.04);
    applyPreset(LUT_PRESETS[5]); // flat-raw
  };

  // Copy ASC CDL Data to clipboard
  const copyCDLData = () => {
    playSuccessSound();
    const cdlXml = `<!-- ASC CDL Color Decision List Export // Manish Kuntal Color Pipeline -->
<ColorCorrection id="${activeShot.id}_grade">
  <SOPNode>
    <Slope>${(1 + gain.level / 100 + gain.x * 0.4).toFixed(4)} ${(1 + gain.level / 100 - (gain.x + gain.y) * 0.2).toFixed(4)} ${(1 + gain.level / 100 + gain.y * 0.4).toFixed(4)}</Slope>
    <Offset>${(lift.level / 200 + lift.x * 0.15).toFixed(4)} ${(lift.level / 200 - (lift.x + lift.y) * 0.1).toFixed(4)} ${(lift.level / 200 + lift.y * 0.15).toFixed(4)}</Offset>
    <Power>${(1 - gamma.level / 150 - gamma.x * 0.2).toFixed(4)} ${(1 - gamma.level / 150 + (gamma.x + gamma.y) * 0.1).toFixed(4)} ${(1 - gamma.level / 150 - gamma.y * 0.2).toFixed(4)}</Power>
  </SOPNode>
  <SatNode>
    <Saturation>${saturation.toFixed(3)}</Saturation>
  </SatNode>
  <LUTProfile applied="${activeLut.name}" colorSpace="${activeShot.colorSpace}" />
</ColorCorrection>`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cdlXml);
    }
    setCopiedCDL(true);
    setTimeout(() => setCopiedCDL(false), 2400);
  };

  // ── Split Wipe Touch/Pointer Handling ─────────────────────────────────────
  const handleWipeMove = useCallback((clientX) => {
    if (!wipeContainerRef.current) return;
    const rect = wipeContainerRef.current.getBoundingClientRect();
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(95, Math.max(5, rawPct)));
  }, []);

  const onWipePointerDown = (e) => {
    e.preventDefault();
    setIsWiping(true);
    handleWipeMove(e.clientX);
  };

  useEffect(() => {
    if (!isWiping) return;
    const onPointerMove = (e) => handleWipeMove(e.clientX);
    const onPointerUp = () => setIsWiping(false);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isWiping, handleWipeMove]);

  // Compute CSS Filter String
  const computedFilter = useMemo(() => {
    // Lift brightness shift
    const brightnessVal = 1 + (lift.level * 0.003) + (gain.level * 0.004);
    // Temperature warm/cool filter shift
    const sepiaVal = temperature > 0 ? (temperature / 100) * 0.35 : 0;
    const hueVal = (tint * 0.4) + (temperature < 0 ? temperature * 0.25 : 0);

    return `contrast(${contrast}) saturate(${saturation}) brightness(${brightnessVal}) sepia(${sepiaVal}) hue-rotate(${hueVal}deg)`;
  }, [contrast, saturation, lift.level, gain.level, temperature, tint]);

  // Dynamic Tint Overlays
  const liftColor = `rgba(${Math.max(0, Math.round(128 + lift.x * 255))}, ${Math.max(0, Math.round(128 - (lift.x + lift.y) * 130))}, ${Math.max(0, Math.round(128 + lift.y * 255))}, ${Math.min(0.35, Math.hypot(lift.x, lift.y) * 0.5)})`;
  const gainColor = `rgba(${Math.max(0, Math.round(128 + gain.x * 255))}, ${Math.max(0, Math.round(128 - (gain.x + gain.y) * 130))}, ${Math.max(0, Math.round(128 + gain.y * 255))}, ${Math.min(0.4, Math.hypot(gain.x, gain.y) * 0.6)})`;

  return (
    <section id="colorlab" className="relative py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto scroll-mt-24">
      
      {/* ── Section Title & Telemetry Header ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-acid shadow-acid-glow animate-pulse" />
            <span className="font-mono text-[0.625rem] text-[var(--c-muted)] uppercase tracking-widest">
              LIVE GRADING SUITE // 03 — DAVINCI COLOR LAB
            </span>
          </div>

          <h2
            className="font-display font-extrabold text-[var(--c-text)] tracking-tight"
            style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontSize: 'clamp(2.1rem, 5vw, 3.8rem)', 
              lineHeight: 1 
            }}
          >
            INTERACTIVE COLOR WHEELS
          </h2>

          <p className="font-mono text-xs sm:text-sm text-[var(--c-text-dim)] mt-3 max-w-2xl leading-relaxed">
            Drag the live Lift, Gamma, and Gain 3-way trackballs or apply 35mm Hollywood film stock LUTs in real time to grade uncompressed cinema plates.
          </p>
        </div>

        {/* Action Buttons: Reset & Export CDL */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text-dim)] hover:text-[var(--c-text)] hover:border-[var(--c-text-dim)] transition-colors"
            title="Reset to Flat Camera RAW"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO RAW</span>
          </button>

          <button
            type="button"
            onClick={copyCDLData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-acid text-black font-bold border border-acid shadow-acid-glow hover:brightness-105 transition-all"
            title="Copy ASC CDL XML node parameters"
          >
            {copiedCDL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCDL ? 'COPIED CDL XML' : 'COPY CDL DATA'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Studio Grid (Viewport + Scopes + Deck) ────────────────────── */}
      <div className="rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl overflow-hidden transition-colors duration-300">
        
        {/* Top Control Bar: Scene Selectors */}
        <div className="px-5 py-3.5 border-b border-[var(--c-border)] bg-[var(--c-surface-inner)]/60 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            <span className="font-mono text-[0.625rem] text-[var(--c-muted)] uppercase tracking-wider mr-2 flex-none hidden sm:inline">
              SELECT SCENE:
            </span>
            {CINEMA_SHOTS.map((shot) => {
              const isSelected = shot.id === activeShot.id;
              return (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => {
                    playClickSound(1400, 0.03);
                    setActiveShot(shot);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[0.625rem] tracking-wider uppercase transition-all flex-none flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--c-text)] text-[var(--c-bg)] font-bold shadow-sm'
                      : 'bg-[var(--c-surface)] text-[var(--c-text-dim)] border border-[var(--c-border)] hover:text-[var(--c-text)]'
                  }`}
                >
                  <Film className="w-3 h-3 opacity-60" />
                  <span>{shot.name.split('//')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono text-[0.625rem] text-[var(--c-muted)]">
            <span className="hidden lg:inline">{activeShot.camera}</span>
            <span className="hidden lg:inline">·</span>
            <span>{activeShot.format}</span>
          </div>

        </div>

        {/* ── Interactive Viewport Area ────────────────────────────────────── */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-black overflow-hidden select-none" ref={wipeContainerRef}>
          
          {/* AFTER: Custom Graded Image Layer (Full Frame) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              filter: computedFilter,
            }}
          >
            <img
              src={activeShot.rawImage}
              alt="Graded Cinema Still"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />

            {/* Shadow Tint Overlay (Lift color shift) */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-color"
              style={{ backgroundColor: liftColor }}
            />

            {/* Highlight Tint Overlay (Gain color shift) */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
              style={{ backgroundColor: gainColor }}
            />

            {/* 35mm Organic Film Grain Simulation Layer */}
            {filmGrain && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                  backgroundSize: '120px 120px',
                }}
              />
            )}
          </div>

          {/* BEFORE: Flat Raw Log Image (Clipped to left side of wipe) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${splitPct}%` }}
          >
            <img
              src={activeShot.rawImage}
              alt="Flat Raw Camera Log"
              className="absolute inset-0 w-full h-full object-cover raw-log-plate"
              style={{
                width: `${(100 / splitPct) * 100}%`,
                maxWidth: 'none',
              }}
              draggable={false}
            />

            {/* Flat Log Label on Top-Left */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[0.5625rem] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>FLAT RAW // {activeShot.colorSpace}</span>
            </div>
          </div>

          {/* Custom Grade Label on Top-Right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-acid/40 text-acid font-mono text-[0.5625rem] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-acid animate-ping" />
            <span>CUSTOM GRADE // {activeLut.name}</span>
          </div>

          {/* ── Draggable Wipe Hairline Divider ────────────────────────────── */}
          <div
            onPointerDown={onWipePointerDown}
            className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-col-resize group touch-none"
            style={{ left: `${splitPct}%`, transform: 'translateX(-50%)', width: 28 }}
          >
            {/* Glowing vertical hairline line */}
            <div className="w-[2px] h-full bg-acid shadow-[0_0_10px_rgba(226,249,82,0.8)]" />

            {/* Center Slide Handle Pill */}
            <div className="absolute top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-black/90 border border-acid text-acid font-mono text-[0.5rem] tracking-widest uppercase flex items-center gap-1 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <span>‹</span>
              <span>WIPE</span>
              <span>›</span>
            </div>
          </div>

          {/* Dynamic Live RGB Waveform Parade Widget (Bottom Right) */}
          <div className="absolute bottom-3 right-4 z-20 hidden sm:flex flex-col gap-1 p-2 rounded-lg bg-black/80 border border-white/15 backdrop-blur-md w-36">
            <div className="flex items-center justify-between text-[0.5rem] font-mono text-white/60 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-acid" />
                RGB PARADE
              </span>
              <span>100%</span>
            </div>
            {/* Simulated Live Channel Bands */}
            <div className="h-8 flex items-end gap-1 px-1">
              {/* Red wave */}
              <div 
                className="flex-1 bg-red-500/80 rounded-t-sm transition-all duration-150"
                style={{ height: `${Math.min(98, Math.max(15, 50 + gain.x * 40 + lift.level * 0.4))}%` }}
              />
              {/* Green wave */}
              <div 
                className="flex-1 bg-green-500/80 rounded-t-sm transition-all duration-150"
                style={{ height: `${Math.min(98, Math.max(15, 55 - (gain.x + gain.y) * 20 + gamma.level * 0.3))}%` }}
              />
              {/* Blue wave */}
              <div 
                className="flex-1 bg-blue-500/80 rounded-t-sm transition-all duration-150"
                style={{ height: `${Math.min(98, Math.max(15, 48 + gain.y * 40 + temperature * -0.5))}%` }}
              />
            </div>
          </div>

        </div>

        {/* ── Preset LUT Tape Deck ─────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-[var(--c-border)] bg-[var(--c-surface-inner)]/30">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[0.625rem] text-[var(--c-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-acid" />
              CINEMATIC LUT & PRINT EMULATION DECK
            </span>
            <span className="font-mono text-[0.5625rem] text-[var(--c-text-dim)]">
              ACTIVE LOOK: {activeLut.name} ({activeLut.label})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {LUT_PRESETS.map((lut) => {
              const isSelected = activeLut.id === lut.id;
              return (
                <button
                  key={lut.id}
                  type="button"
                  onClick={() => applyPreset(lut)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-acid bg-acid/10 shadow-sm'
                      : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-text-dim)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-mono text-[0.6875rem] font-bold tracking-wider uppercase truncate ${
                      isSelected ? 'text-acid' : 'text-[var(--c-text)]'
                    }`}>
                      {lut.name}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-acid shadow-acid-glow flex-none" />
                    )}
                  </div>
                  <p className="font-mono text-[0.5rem] text-[var(--c-text-dim)] truncate">
                    {lut.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3-Way DaVinci Color Wheels Section ───────────────────────────── */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[0.6875rem] font-bold text-[var(--c-text)] uppercase tracking-widest flex items-center gap-2">
              <Palette className="w-4 h-4 text-acid" />
              PRIMARY 3-WAY COLOR WHEELS
            </span>
            <span className="font-mono text-[0.6rem] text-[var(--c-muted)]">
              DRAG PUCKS FOR CHROMATIC SHIFT · ROTATE WHEEL SLIDERS FOR MASTERS
            </span>
          </div>

          {/* 3 Wheels: Lift, Gamma, Gain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. LIFT (Shadows) */}
            <ColorWheel
              title="LIFT"
              sub="SHADOWS PEDESTAL"
              value={lift}
              onChange={setLift}
              masterColor="#60A5FA"
            />

            {/* 2. GAMMA (Midtones) */}
            <ColorWheel
              title="GAMMA"
              sub="MIDTONES BALANCE"
              value={gamma}
              onChange={setGamma}
              masterColor="#A78BFA"
            />

            {/* 3. GAIN (Highlights) */}
            <ColorWheel
              title="GAIN"
              sub="HIGHLIGHT EXPOSURE"
              value={gain}
              onChange={setGain}
              masterColor="#E2F952"
            />

          </div>

          {/* ── Secondary Master Sliders Strip ──────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-[var(--c-border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[0.625rem]">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">TEMPERATURE</span>
                <span className="text-[var(--c-text)] font-bold">{temperature > 0 ? `+${temperature}K` : `${temperature}K`}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-acid cursor-pointer h-1.5 rounded-full bg-[var(--c-surface-inner)]"
              />
            </div>

            {/* Tint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[0.625rem]">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">TINT (GREEN / MAGENTA)</span>
                <span className="text-[var(--c-text)] font-bold">{tint > 0 ? `+${tint}` : tint}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={tint}
                onChange={(e) => setTint(Number(e.target.value))}
                className="w-full accent-acid cursor-pointer h-1.5 rounded-full bg-[var(--c-surface-inner)]"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[0.625rem]">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">CONTRAST</span>
                <span className="text-[var(--c-text)] font-bold">{contrast.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.7"
                step="0.02"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-acid cursor-pointer h-1.5 rounded-full bg-[var(--c-surface-inner)]"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[0.625rem]">
                <span className="text-[var(--c-muted)] uppercase tracking-wider">SATURATION</span>
                <span className="text-[var(--c-text)] font-bold">{Math.round(saturation * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.8"
                step="0.02"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-acid cursor-pointer h-1.5 rounded-full bg-[var(--c-surface-inner)]"
              />
            </div>

          </div>

          {/* Node Pipeline Flow */}
          <div className="mt-6 pt-5 border-t border-[var(--c-border)] flex flex-wrap items-center justify-between gap-4 font-mono text-[0.5625rem] text-[var(--c-muted)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--c-text)] font-bold uppercase">NODES:</span>
              <span className="px-2 py-0.5 rounded bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)]">01 CST INPUT</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-acid font-bold">02 3-WAY PRIMARY</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)]">03 {activeLut.name}</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-[var(--c-surface-inner)] border border-[var(--c-border)] text-[var(--c-text)]">04 REC.709 ODT</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFilmGrain(!filmGrain)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                  filmGrain
                    ? 'border-acid text-acid bg-acid/10 font-bold'
                    : 'border-[var(--c-border)] text-[var(--c-muted)]'
                }`}
              >
                <span>35MM GRAIN: {filmGrain ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ColorWheel Component (DaVinci Resolve Style Trackball Wheel)
// ─────────────────────────────────────────────────────────────────────────────
function ColorWheel({ title, sub, value, onChange, masterColor }) {
  const wheelRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = 64; // px

  // Compute pointer position into -1 to +1 coordinates
  const computeCoords = useCallback((clientX, clientY) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (clientX - centerX) / radius;
    const dy = (clientY - centerY) / radius;

    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      onChange((prev) => ({
        ...prev,
        x: dx / distance,
        y: dy / distance,
      }));
    } else {
      onChange((prev) => ({
        ...prev,
        x: dx,
        y: dy,
      }));
    }
  }, [onChange, radius]);

  const onPointerDown = (e) => {
    e.preventDefault();
    playClickSound(1800, 0.02);
    setIsDragging(true);
    computeCoords(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onPointerMove = (e) => computeCoords(e.clientX, e.clientY);
    const onPointerUp = () => setIsDragging(false);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, computeCoords]);

  // Double click resets puck to exact neutral center
  const resetWheel = (e) => {
    e.stopPropagation();
    playClickSound(1200, 0.03);
    onChange((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  const puckX = value.x * radius;
  const puckY = value.y * radius;

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-[var(--c-surface-inner)]/50 border border-[var(--c-border)] transition-all hover:border-[var(--c-text-dim)]/40">
      
      {/* Wheel Title & Sub */}
      <div className="text-center mb-4">
        <h4 className="font-mono text-xs font-extrabold text-[var(--c-text)] tracking-wider">
          {title}
        </h4>
        <p className="font-mono text-[0.5rem] text-[var(--c-muted)] tracking-widest mt-0.5 uppercase">
          {sub}
        </p>
      </div>

      {/* Circular Chromatic Color Wheel */}
      <div
        ref={wheelRef}
        onPointerDown={onPointerDown}
        onDoubleClick={resetWheel}
        className="relative rounded-full cursor-crosshair select-none shadow-inner border border-white/10 touch-none"
        style={{
          width: radius * 2,
          height: radius * 2,
          background: `
            radial-gradient(circle at center, #808080 0%, transparent 70%),
            conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)
          `,
        }}
      >
        {/* Neutral Core Mask */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(128,128,128,0.92) 0%, rgba(128,128,128,0.3) 60%, transparent 100%)',
          }}
        />

        {/* Center Crosshair Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-full h-px bg-white" />
          <div className="h-full w-px bg-white absolute" />
        </div>

        {/* Draggable Indicator Puck */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white bg-black/80 shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-75"
          style={{
            left: `calc(50% + ${puckX}px)`,
            top: `calc(50% + ${puckY}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5 shadow-sm"
            style={{ backgroundColor: masterColor || 'var(--c-acid)' }}
          />
        </div>
      </div>

      {/* Coordinate Vector Readout */}
      <div className="flex items-center gap-3 font-mono text-[0.5625rem] text-[var(--c-muted)] mt-4">
        <span>X: <strong className="text-[var(--c-text)]">{value.x > 0 ? `+${value.x.toFixed(2)}` : value.x.toFixed(2)}</strong></span>
        <span>·</span>
        <span>Y: <strong className="text-[var(--c-text)]">{value.y > 0 ? `+${value.y.toFixed(2)}` : value.y.toFixed(2)}</strong></span>
        <button
          type="button"
          onClick={resetWheel}
          className="ml-1 hover:text-[var(--c-text)] transition-colors"
          title="Reset wheel to center"
        >
          <RotateCcw className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Master Exposure / Pedestal Horizontal Dial */}
      <div className="w-full mt-4 pt-3 border-t border-[var(--c-border)]/60">
        <div className="flex items-center justify-between font-mono text-[0.5625rem] mb-1.5">
          <span className="text-[var(--c-muted)] uppercase">MASTER LEVEL</span>
          <span className="text-[var(--c-text)] font-bold">{value.level > 0 ? `+${value.level}` : value.level}</span>
        </div>
        <input
          type="range"
          min="-30"
          max="30"
          value={value.level}
          onChange={(e) => onChange((prev) => ({ ...prev, level: Number(e.target.value) }))}
          className="w-full accent-acid cursor-pointer h-1.5 rounded-full bg-[var(--c-surface)]"
        />
      </div>

    </div>
  );
}
