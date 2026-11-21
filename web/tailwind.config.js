/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F3F3EC',
        coral: {
          light: '#FF8A70',
          DEFAULT: '#FF6748',
          dark: '#E55335',
        },
        navy: {
          light: '#243E6B',
          DEFAULT: '#172B4D',
          dark: '#0E1C33',
        },
        teal: {
          light: '#1EB8A5',
          DEFAULT: '#159A8A',
          dark: '#0E786B',
        },
        card: '#FFFFFF',
        border: '#DADAD2',
        'text-primary': '#171717',
        'text-secondary': '#77776F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
