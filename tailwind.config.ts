import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#141d2f',
          900: '#0d1322',
          950: '#080c16',
        },
        luxury: {
          gold: '#cba135',
          goldLight: '#e4c36a',
          goldDark: '#a37b1d',
          bronze: '#8c6d31',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0171c7',
          700: '#025aa1',
          800: '#064c84',
          900: '#0b3f6e',
          950: '#072849',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
