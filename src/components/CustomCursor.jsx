import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// CustomCursor
// Subtle precision cursor follower displaying contextual text:
// - "DRAG" when hovering over split-screen slider
// - "INSPECT" when hovering over RAW contact items
// - Hidden automatically on touch / mobile devices
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState('DEFAULT'); // 'DEFAULT', 'DRAG', 'INSPECT', 'LINK'
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad, not touch)
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const onMediaChange = (e) => setIsFinePointer(e.matches);
    mediaQuery.addEventListener('change', onMediaChange);

    const onMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Inspect target element for cursor cues
      const target = e.target;
      if (!target) return;

      const closestDrag = target.closest('[data-cursor="DRAG"]') || target.closest('.split-slider-container');
      const closestInspect = target.closest('[data-cursor="INSPECT"]') || target.closest('.contact-sheet-frame');
      const closestInteractive = target.closest('button, a, input, [role="button"]');

      if (closestDrag) {
        setCursorType('DRAG');
      } else if (closestInspect) {
        setCursorType('INSPECT');
      } else if (closestInteractive) {
        setCursorType('HOVER');
      } else {
        setCursorType('DEFAULT');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  // Don't render on touch/mobile devices
  if (!isFinePointer || !isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" 
      aria-hidden="true"
    >
      <motion.div
        className="fixed top-0 left-0 pointer-events-none flex items-center justify-center"
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 400,
          mass: 0.15,
        }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AnimatePresence mode="wait">
          {cursorType === 'DRAG' ? (
            /* Contextual DRAG pill */
            <motion.div
              key="cursor-drag"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-2.5 py-1 rounded-full bg-[#E2F952] text-[#08080A] font-mono text-[0.625rem] font-bold tracking-widest uppercase shadow-acid-glow flex items-center gap-1.5 select-none"
            >
              <span className="text-[0.6rem]">‹</span>
              <span>DRAG</span>
              <span className="text-[0.6rem]">›</span>
            </motion.div>
          ) : cursorType === 'INSPECT' ? (
            /* Contextual INSPECT pill */
            <motion.div
              key="cursor-inspect"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-3 py-1 rounded-full bg-[#08080A]/90 border border-acid/60 text-acid font-mono text-[0.6rem] font-bold tracking-wider uppercase shadow-acid-glow flex items-center gap-1.5 select-none backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
              <span>INSPECT</span>
            </motion.div>
          ) : cursorType === 'HOVER' ? (
            /* Subtle link/button magnetic ring */
            <motion.div
              key="cursor-hover"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 rounded-full border border-acid/40 bg-acid/[0.04]"
            />
          ) : (
            /* Default minimal precision dot */
            <motion.div
              key="cursor-default"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-2 h-2 rounded-full bg-acid/80 shadow-acid-glow"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
