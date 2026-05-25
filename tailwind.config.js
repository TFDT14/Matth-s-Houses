/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mh: {
          noir:     '#0a0a0a',
          'noir-2': '#161616',
          'noir-3': '#1f1f1f',
          paper:    '#ffffff',
          'paper-2':'#fafaf9',
          'paper-3':'#f4f3f0',
          line:     '#e8e6e0',
          'line-2': '#d9d6cf',
          text:     '#0a0a0a',
          'text-2': '#525050',
          'text-3': '#8a857c',
          'text-4': '#b8b3a8',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        mh:    '10px',
        'mh-lg': '12px',
      },
    },
  },
  plugins: [],
}
