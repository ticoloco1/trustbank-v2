import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"','system-ui','sans-serif'],
        mono: ['"JetBrains Mono"','monospace'],
      },
      colors: {
        accent: { DEFAULT:'#8b5cf6', dark:'#7c3aed', light:'#a78bfa' },
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease',
        'ticker':     'ticker 35s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.3s ease',
      },
      keyframes: {
        fadeUp:     { from:{opacity:'0',transform:'translateY(14px)'},to:{opacity:'1',transform:'translateY(0)'} },
        slideDown:  { from:{opacity:'0',transform:'translateY(-8px)'},to:{opacity:'1',transform:'translateY(0)'} },
        ticker:     { from:{transform:'translateX(0)'},to:{transform:'translateX(-50%)'} },
        glowPulse:  { '0%,100%':{opacity:'0.4'},'50%':{opacity:'0.8'} },
      },
      backdropBlur: { glass: '20px' },
    },
  },
  plugins: [],
};
export default config;
