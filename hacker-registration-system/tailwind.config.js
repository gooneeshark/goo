/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hacker-green': '#00ff00',
        'hacker-dark': '#000000',
        'hacker-gray': '#1a1a1a',
        'hacker-red': '#ff0000',
        'terminal-green': '#00ff41',
        'matrix-green': '#008f11',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'terminal': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s infinite',
        'glitch': 'glitch 0.3s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00',
            opacity: '1'
          },
          '50%': { 
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
            opacity: '0.8'
          },
        },
      },
    },
  },
  plugins: [],
}