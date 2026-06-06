/* tailwind.config.ts */
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',

        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',

        text: 'hsl(var(--text) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',

        primary: 'hsl(var(--primary) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',

        app: {
          bg: 'var(--color-background)',
          surface: 'var(--color-surface)',
          'surface-muted': 'var(--color-surface-muted)',
          'surface-soft': 'var(--color-surface-soft)',

          border: 'var(--color-border)',
          'border-soft': 'var(--color-border-soft)',
          'border-strong': 'var(--color-border-strong)',

          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          'text-soft': 'var(--color-text-soft)',

          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-soft': 'var(--color-primary-soft)',
          'primary-border': 'var(--color-primary-border)',

          success: 'var(--color-success)',
          'success-soft': 'var(--color-success-soft)',
          'success-border': 'var(--color-success-border)',

          warning: 'var(--color-warning)',
          'warning-soft': 'var(--color-warning-soft)',
          'warning-border': 'var(--color-warning-border)',

          info: 'var(--color-info)',
          'info-soft': 'var(--color-info-soft)',
          'info-border': 'var(--color-info-border)',
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)'],
      },

      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        panel: 'var(--shadow-panel)',
        floating: 'var(--shadow-floating)',
      },

      spacing: {
        '0.5': 'var(--space-0-5)',
        '0.75': 'var(--space-0-75)',
        '1': 'var(--space-1)',
        '1.25': 'var(--space-1-25)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '4.5': 'var(--space-4-5)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
      },

      transitionDuration: {
        fast: 'var(--transition-fast)',
        DEFAULT: 'var(--transition)',
      },

      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        emphasized: 'var(--ease-emphasized)',
      },
    },
  },
  plugins: [],
};

export default config;