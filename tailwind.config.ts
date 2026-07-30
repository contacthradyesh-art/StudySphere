import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // NOTE: these three scales are used all over the app (e.g. bg-charcoal-950,
        // text-electric-200, border-neon/30) but were never wired into this config,
        // so those classes silently produced no CSS at all (no error, just invisible
        // styling) — this is why selected-answer highlights, badges, etc. weren't
        // showing even though the underlying click/state logic was correct.
        charcoal: {
          50: '#f3f3f5', 100: '#e8e8ea', 200: '#cfd0d6', 300: '#9fa0a8', 400: '#797a85',
          500: '#5c5e6a', 600: '#3f4150', 700: '#292a37', 800: '#1b1c27', 900: '#16171f', 950: '#0e0f18'
        },
        electric: { DEFAULT: '#00aeff', 100: '#c8ebff', 200: '#7ad0ff', 300: '#3fbaff', 400: '#00aeff', 500: '#007edc', 600: '#004da9' },
        neon: { DEFAULT: '#00e805', 100: '#d6ffd7', 200: '#8ef58f', 300: '#2fee34', 400: '#00e805', 500: '#007e00' }
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, hsl(var(--primary)) 0%, #8b5cf6 50%, #ec4899 100%)'
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } }
      },
      animation: { 'fade-in': 'fade-in 0.4s ease-out' }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;