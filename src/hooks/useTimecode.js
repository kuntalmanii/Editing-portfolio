import { useState, useEffect, useRef } from 'react';

/**
 * useTimecode
 * Returns a running SMPTE-style timecode string: HH:MM:SS:FF
 * framerate defaults to 24fps (cinema standard).
 */
export function useTimecode(fps = 24) {
  const startRef = useRef(Date.now());
  const [tc, setTc] = useState('00:00:00:00');
  const lastTcRef = useRef('00:00:00:00');

  useEffect(() => {
    let raf;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const totalFrames = Math.floor((elapsed / 1000) * fps);
      const ff = totalFrames % fps;
      const totalSecs = Math.floor(totalFrames / fps);
      const ss = totalSecs % 60;
      const mm = Math.floor(totalSecs / 60) % 60;
      const hh = Math.floor(totalSecs / 3600);
      const pad = (n, len = 2) => String(n).padStart(len, '0');
      const nextTc = `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
      if (nextTc !== lastTcRef.current) {
        lastTcRef.current = nextTc;
        setTc(nextTc);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps]);

  return tc;
}
