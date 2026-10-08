/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./animations/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ededed",
        accent: "#FF0000",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Outfit", "sans-serif"],
        elegant: ["Bodoni Moda", "serif"],
      },
    },
  },
  plugins: [],
}
