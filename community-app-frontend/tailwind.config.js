/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: "var(--theme-color, #A32328)",
        "theme-light": "var(--theme-color-light, #A3232820)",
      },
    },
  },
  plugins: [],
};
