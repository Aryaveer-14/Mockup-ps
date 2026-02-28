/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'p-bg':       '#0A0A0A',
        'p-elevated': '#141414',
        'p-overlay':  '#1C1C1C',
        'p-border':   '#2A2A2A',
        'p-text':     '#F5F5F0',
        'p-muted':    '#A0A09A',
        'p-disabled': '#4A4A44',
        'p-red':      '#D5001C',
        'p-gold':     '#C9A84C',
      },
      fontFamily: {
        display: ['"Porsche Next"', '"Arial Narrow"', 'sans-serif'],
        body:    ['Arial', 'Helvetica', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.6s ease-out forwards',
        'fade-out': 'fadeOut 0.5s ease-in forwards',
        'draw-in':  'drawIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0,0,0.2,1) forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
        drawIn:  { from: { 'stroke-dashoffset': '400' }, to: { 'stroke-dashoffset': '0' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
