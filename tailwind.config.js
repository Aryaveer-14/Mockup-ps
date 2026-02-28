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
        // Aligned with VISUAL_DIRECTION.md — Feb 2026
        // Off-black surfaces. Pure #000 used only in the intro screen.
        'p-bg':       '#0D0D0D',
        'p-elevated': '#161616',
        'p-overlay':  '#1E1E1E',
        'p-border':   '#272727',
        // Warm off-whites. Never #FFFFFF for body text.
        'p-text':     '#EDEDE8',
        'p-muted':    '#8A8A84',
        'p-disabled': '#3E3E3A',
        // Accents — one per screen maximum
        'p-red':      '#D5001C', // Crest only — never UI chrome
        'p-gold':     '#C4A24A', // Selected states only
        'p-white':    '#F0F0EC', // Primary CTA fill only
      },
      // Sharp corners — luxury, not friendly. Max 4px allowed.
        borderRadius: {
          'none': '0px',
          'sm':   '0px',  // default card/button radius
          'md':   '2px',  // subtle softening (swatches)
          'lg':   '4px',  // absolute maximum
          'full': '9999px',
        },
        letterSpacing: {
          'hero':   '-0.03em',
          'title':  '-0.025em',
          'tight':  '-0.01em',
          'normal':  '0em',
          'wide':    '0.06em',
          'wider':   '0.12em',
          'label':   '0.09em',
        },
        lineHeight: {
          'display': '0.9',
          'heading': '1.3',
          'body':    '1.6',
          'label':   '1.2',
        },
        transitionDuration: {
          'hover':  '120ms',
          'micro':  '150ms',
          'fast':   '250ms',
          'normal': '380ms',
          'slow':   '500ms',
          'phase':  '550ms',
        },
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
