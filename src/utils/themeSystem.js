// ─────────────────────────────────────────────────────────────────────────────
// themeSystem.js
// Visual Studio Theme Manager:
// - 'dark': Dark Room (Onyx #08080A)
// - 'light': Daylight Studio (Clean High-Key Editorial Light #F4F4F6)
// ─────────────────────────────────────────────────────────────────────────────

import { playClickSound } from './audioSystem';

let currentTheme = 'dark';

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('framerate_theme');
    if (saved === 'light' || saved === 'dark') {
      currentTheme = saved;
    }
  } catch (e) {}

  // Apply to document root immediately
  applyThemeToDOM(currentTheme);
}

function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
}

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  currentTheme = theme;
  try {
    localStorage.setItem('framerate_theme', theme);
  } catch (e) {}

  applyThemeToDOM(theme);
  playClickSound(1600, 0.05);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('framerate-theme-changed', { detail: { theme } }));
  }
}

export function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
