import type { Config } from 'tailwindcss';

// Tailwind reads the CSS custom properties defined in app/globals.css.
// Mapping them here lets us write clean classes (bg-surface, text-muted,
// border-hairline) instead of arbitrary [var(--token)] values everywhere.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        soft: 'var(--bg-soft)',
        surface: 'var(--surface)',
        ink: 'var(--text)',
        muted: 'var(--text-muted)',
        hairline: 'var(--border)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        success: 'var(--success)',
        danger: 'var(--danger)',
      },
      maxWidth: { content: '72rem' },
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
export default config;
