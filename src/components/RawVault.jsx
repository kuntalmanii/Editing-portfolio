import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Folder, 
  FolderOpen, 
  HardDrive, 
  Database, 
  Film,
  PanelLeftClose,
  PanelLeftOpen,
  Eye
} from 'lucide-react';
import { rawVaultFolders } from '../data/portfolioData';
import ExifDrawer from './ExifDrawer';

// ─────────────────────────────────────────────────────────────────────────────
// RawVault
// The RAW Vault section:
// 1. Two-column desktop split (collapsible file tree left, contact sheet grid right)
// 2. Interactive folder list (/DCIM/2026_STREET/, /DCIM/STUDIO_PORTRAITS/, /DCIM/NARRATIVE_STILLS/)
// 3. Photography contact-sheet grid with monospace frame indices & negative-style borders
// 4. Click opens ExifDrawer inspector overlay
// ─────────────────────────────────────────────────────────────────────────────

export default function RawVault() {
  const [activeFolderId, setActiveFolderId] = useState('folder-01');
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [selectedStillIndex, setSelectedStillIndex] = useState(null);

  const activeFolder = rawVaultFolders.find((f) => f.id === activeFolderId) || rawVaultFolders[0];
  const items = activeFolder.items || [];
  const selectedStill = selectedStillIndex !== null ? items[selectedStillIndex] : null;

  // Next / Previous still within currently active folder
  const handleNextStill = () => {
    if (selectedStillIndex !== null && selectedStillIndex < items.length - 1) {
      setSelectedStillIndex(selectedStillIndex + 1);
    }
  };

  const handlePrevStill = () => {
    if (selectedStillIndex !== null && selectedStillIndex > 0) {
      setSelectedStillIndex(selectedStillIndex - 1);
    }
  };

  // Total raw assets across all folders
  const totalAssetsCount = rawVaultFolders.reduce((sum, f) => sum + (f.items?.length || 0), 0);

  return (
    <section id="vault" className="relative py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-acid shadow-acid-glow" />
            <span className="font-mono text-[0.625rem] text-[#71717A] tracking-widest uppercase">
              ARCHIVE TELEMETRY // 02
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
            THE RAW VAULT
          </h2>

          <p className="font-mono text-[0.6875rem] text-[#A1A1AA] tracking-wider mt-3 max-w-xl">
            Uncompressed camera plates, digital contact sheets, and complete EXIF telemetry parsed from in-camera native capture.
          </p>
        </div>

        {/* Header Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[0.625rem]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111116] border border-[#27272A] text-[#A1A1AA]">
            <HardDrive className="w-3.5 h-3.5 text-acid" />
            <span>MOUNT: /VOLUMES/RED_MAG</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111116] border border-[#27272A] text-[#A1A1AA]">
            <Database className="w-3.5 h-3.5 text-tally" />
            <span>{totalAssetsCount} CAMERA PLATES</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E2F952]/[0.08] border border-acid/30 text-acid font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
            <span>ACES 2065-1 ARCHIVE</span>
          </div>
        </div>
      </div>

      {/* ── Master Directory Layout (Two-Column Desktop Split) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left Panel: Interactive File Tree (Collapsible) ─────────── */}
        <div 
          className={`transition-all duration-300 ${
            isTreeCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'
          }`}
        >
          <div className="rounded-lg bg-[#0E0E12] border border-[#27272A] overflow-hidden sticky top-28 shadow-xl">

            {/* Tree Terminal Top Bar */}
            <div className="px-4 py-3 bg-[#131318] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30] opacity-80" />
                <span className="w-2 h-2 rounded-full bg-[#FF9500] opacity-80" />
                <span className="w-2 h-2 rounded-full bg-[#34C759] opacity-80" />
                {!isTreeCollapsed && (
                  <span className="font-mono text-[0.6rem] text-[#71717A] tracking-wider truncate ml-2">
                    root@dcim:~$ ls -la /DCIM/
                  </span>
                )}
              </div>

              {/* Collapse/Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
                className="hidden lg:flex items-center gap-1 text-[#71717A] hover:text-white font-mono text-[0.5625rem] tracking-wider uppercase transition-colors"
                title={isTreeCollapsed ? 'Expand directory tree' : 'Collapse directory tree'}
              >
                {isTreeCollapsed ? (
                  <PanelLeftOpen className="w-3.5 h-3.5 text-acid" />
                ) : (
                  <>
                    <span>COLLAPSE</span>
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* If tree is collapsed on desktop, show vertical mini-strip */}
            {isTreeCollapsed ? (
              <div className="hidden lg:flex flex-col items-center py-4 gap-3">
                {rawVaultFolders.map((folder, idx) => {
                  const isActive = folder.id === activeFolderId;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setActiveFolderId(folder.id)}
                      title={`${folder.path} (${folder.items.length} items)`}
                      className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-acid/10 border border-acid text-acid shadow-acid-glow'
                          : 'bg-[#14141A] border border-[#27272A] text-[#71717A] hover:text-white hover:border-[#52525B]'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Expanded Folder List */
              <div className="p-3 sm:p-4 space-y-2">
                <div className="font-mono text-[0.5625rem] text-[#52525B] tracking-widest uppercase px-2 mb-2">
                  VOLUMES // FLASH DIRECTORY
                </div>

                {rawVaultFolders.map((folder, index) => {
                  const isActive = folder.id === activeFolderId;
                  const isLast = index === rawVaultFolders.length - 1;

                  return (
                    <div key={folder.id} className="relative">
                      {/* Tree connector indicator */}
                      <button
                        type="button"
                        onClick={() => setActiveFolderId(folder.id)}
                        className={`w-full text-left p-3 rounded-md transition-all group flex items-start gap-3 relative ${
                          isActive
                            ? 'bg-[#16161E] border border-acid/40 shadow-sm'
                            : 'bg-[#111116]/80 hover:bg-[#14141A] border border-[#1E1E24] hover:border-[#3F3F46]'
                        }`}
                      >
                        {/* Active left acid bar highlight */}
                        {isActive && (
                          <motion.span
                            layoutId="activeFolderPill"
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-acid shadow-acid-glow"
                          />
                        )}

                        {/* Folder icon */}
                        <div className="flex-none mt-0.5">
                          {isActive ? (
                            <FolderOpen className="w-4 h-4 text-acid" />
                          ) : (
                            <Folder className="w-4 h-4 text-[#71717A] group-hover:text-[#A1A1AA] transition-colors" />
                          )}
                        </div>

                        {/* Folder details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span 
                              className={`font-mono text-[0.75rem] font-bold tracking-wide truncate ${
                                isActive ? 'text-white' : 'text-[#D4D4D8] group-hover:text-white'
                              }`}
                            >
                              {folder.path}
                            </span>
                            
                            {/* Item Count badge */}
                            <span 
                              className={`flex-none font-mono text-[0.5625rem] px-2 py-0.5 rounded border transition-colors ${
                                isActive 
                                  ? 'bg-acid/10 border-acid/30 text-acid font-bold' 
                                  : 'bg-[#08080A] border-[#27272A] text-[#71717A]'
                              }`}
                            >
                              [{folder.items.length} STILLS]
                            </span>
                          </div>

                          <p className="font-mono text-[0.6rem] text-[#71717A] group-hover:text-[#A1A1AA] line-clamp-1 mt-1">
                            {folder.description}
                          </p>

                          {/* Quick sub-metadata */}
                          <div className="flex items-center gap-3 mt-2 font-mono text-[0.5625rem] text-[#52525B]">
                            <span>ID: {folder.name}</span>
                            <span>·</span>
                            <span className={isActive ? 'text-acid/80' : ''}>
                              {isActive ? '● MOUNTED & ACTIVE' : 'CACHED'}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}

                {/* Left Panel Telemetry Widget at bottom */}
                <div className="mt-6 pt-4 border-t border-[#1E1E24] px-2 space-y-2.5 font-mono text-[0.6rem]">
                  <div className="flex items-center justify-between text-[#71717A]">
                    <span>MEDIA CARD:</span>
                    <span className="text-[#D4D4D8]">CFexpress Type B (512GB)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#71717A]">
                    <span>BUS SPEED:</span>
                    <span className="text-[#D4D4D8]">PCIe Gen3 ×2 · 1700MB/s</span>
                  </div>
                  <div className="flex items-center justify-between text-[#71717A]">
                    <span>COLOR PIPELINE:</span>
                    <span className="text-acid">ACEScc v1.3 / P3-D65</span>
                  </div>
                  <div className="flex items-center justify-between text-[#71717A]">
                    <span>FILE ENCODING:</span>
                    <span className="text-[#D4D4D8]">14-BIT / 16-BIT UNCOMP</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* ── Right Panel: Photography Contact-Sheet Grid ─────────────── */}
        <div className={`transition-all duration-300 ${isTreeCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'}`}>

          {/* Contact Sheet Banner Header */}
          <div className="mb-6 p-4 rounded-lg bg-[#0E0E12] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-tally animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.625rem] text-[#71717A] uppercase tracking-wider">
                    CURRENT DIRECTORY:
                  </span>
                  <span className="font-mono text-[0.75rem] text-acid font-bold tracking-wider">
                    {activeFolder.path}
                  </span>
                </div>
                <p className="font-mono text-[0.5625rem] text-[#52525B] mt-0.5 tracking-wider">
                  CONTACT SHEET VIEW · CLICK ANY FRAME TO INSPECT EXIF & BASE RAW
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[0.625rem] text-[#71717A]">
              <span className="px-2.5 py-1 rounded bg-[#16161D] border border-[#27272A] text-white">
                {items.length} FRAMES
              </span>
              <span className="px-2.5 py-1 rounded bg-[#16161D] border border-[#27272A] text-[#A1A1AA]">
                1:1 SENSOR REBATE
              </span>
            </div>
          </div>

          {/* Contact-Sheet Grid */}
          <LayoutGroup id="raw-contact-grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() => setSelectedStillIndex(idx)}
                    data-cursor="INSPECT"
                    className="contact-sheet-frame rounded-lg p-3 cursor-pointer group flex flex-col justify-between"
                  >

                    {/* ── Negative Top Rebate Edge ─────────────────────── */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E1E24] text-[#71717A] font-mono text-[0.6rem]">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Film frame number */}
                        <span className="text-acid font-bold tracking-wider px-1.5 py-0.5 rounded bg-acid/10 border border-acid/20">
                          [{item.frameNumber}]
                        </span>
                        {/* Monospace frame index (Requirement) */}
                        <span className="font-mono text-[0.6875rem] text-white font-semibold tracking-wider truncate group-hover:text-acid transition-colors">
                          {item.frameIndex}
                        </span>
                      </div>

                      {/* Film edge simulation code */}
                      <span className="film-rebate-text text-[#52525B] hidden sm:inline flex-none">
                        KODAK 5219 DX400
                      </span>
                    </div>

                    {/* ── Negative Stills Viewport with Thin Film Borders ── */}
                    <div className="relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-black border border-[#27272A] group-hover:border-acid/50 transition-colors">

                      {/* Film negative sprocket notch hints on sides */}
                      <div className="absolute top-2 left-1.5 w-1 h-2 bg-black/60 rounded-sm z-10 border border-white/10" />
                      <div className="absolute bottom-2 left-1.5 w-1 h-2 bg-black/60 rounded-sm z-10 border border-white/10" />
                      <div className="absolute top-2 right-1.5 w-1 h-2 bg-black/60 rounded-sm z-10 border border-white/10" />
                      <div className="absolute bottom-2 right-1.5 w-1 h-2 bg-black/60 rounded-sm z-10 border border-white/10" />

                      {/* Image Preview */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Linked Project Badge in top corner */}
                      {item.linkedProject && (
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#08080A]/90 border border-acid/40 text-acid font-mono text-[0.5625rem] tracking-wider uppercase backdrop-blur-md">
                          <Film className="w-2.5 h-2.5" />
                          <span>LINKED: [{item.linkedProject}]</span>
                        </div>
                      )}

                      {/* Hover Overlay with Quick EXIF HUD */}
                      <div className="absolute inset-0 bg-[#08080A]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-4 backdrop-blur-[2px]">
                        
                        {/* Top quick telemetry */}
                        <div className="flex items-center justify-between text-white font-mono text-[0.625rem]">
                          <span className="text-acid font-semibold">{item.exif.camera}</span>
                          <span>{item.fileSize}</span>
                        </div>

                        {/* Center action affordance */}
                        <div className="self-center flex items-center gap-2 px-3 py-1.5 rounded-full bg-acid text-black font-mono text-[0.625rem] font-bold tracking-wider uppercase shadow-acid-glow transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Eye className="w-3.5 h-3.5" />
                          <span>INSPECT EXIF & RAW</span>
                        </div>

                        {/* Bottom quick exposure summary */}
                        <div className="flex items-center justify-between font-mono text-[0.5625rem] text-[#D4D4D8] border-t border-white/20 pt-2">
                          <span>{item.exif.focalLength}</span>
                          <span>{item.exif.aperture}</span>
                          <span>{item.exif.shutterSpeed}</span>
                          <span>ISO {item.exif.iso}</span>
                        </div>
                      </div>

                    </div>

                    {/* ── Negative Bottom Rebate Edge ──────────────────── */}
                    <div className="pt-3 mt-1 flex items-center justify-between gap-3 text-[#71717A] font-mono text-[0.6rem]">
                      <div className="min-w-0">
                        <p className="text-white font-semibold tracking-wide truncate group-hover:text-acid transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[#52525B] text-[0.5625rem] truncate mt-0.5">
                          {item.location} · {item.exif.camera}
                        </p>
                      </div>

                      <div className="flex-none text-right">
                        <span className="px-2 py-0.5 rounded bg-[#16161D] border border-[#27272A] text-acid font-semibold">
                          {item.fileSize}
                        </span>
                        <p className="text-[#52525B] text-[0.5rem] tracking-wider mt-1">
                          {item.exif.resolution.split(' ')[0]}
                        </p>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>

        </div>

      </div>

      {/* ── EXIF Inspector Overlay Drawer ──────────────────────────────── */}
      {selectedStill && (
        <ExifDrawer
          item={selectedStill}
          folder={activeFolder}
          onClose={() => setSelectedStillIndex(null)}
          onSelectNext={handleNextStill}
          onSelectPrev={handlePrevStill}
          hasNext={selectedStillIndex < items.length - 1}
          hasPrev={selectedStillIndex > 0}
        />
      )}

    </section>
  );
}
