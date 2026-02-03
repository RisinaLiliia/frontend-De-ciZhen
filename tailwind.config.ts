import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '.dark'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F3C88',
          light: '#2F54C8',
          dark: '#142B63',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          soft: '#FEF3C7',
        },
      },
    },
  },
  plugins: [],
};

export default config;
