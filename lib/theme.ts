// Theme utilities for dark mode management

export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';

  const saved = localStorage.getItem('chess-trainer-theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('chess-trainer-theme', theme);
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};
