import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        court: {
          950: '#060c1a',
          900: '#0b1120',
          800: '#111827',
          700: '#1a2234',
          600: '#1e2a3a',
          500: '#2d3748',
        },
        hoop: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c00',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

export default config
