/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './blog.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: '#0A1626', ink2: '#0F2238',
        paper: '#F6F3EC', bone: '#EDE8DD',
        biz: '#E8A33D', analytics: '#3B82F6', agro: '#2FA86A',
        primary: '#3B82F6', secondary: '#1e40af', accent: '#E8A33D',
      },
    },
  },
  plugins: [],
}
