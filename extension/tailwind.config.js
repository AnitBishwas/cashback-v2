/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      primary: ['Roboto'],
      secondary: ['Nunito Sans'],
      heading: ['Nunito Sans'],
    },
    extend: {},
  },
  plugins: [],
  prefix: 'cb-'
}