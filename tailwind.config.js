/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Manrope"', "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#05060A",
        cyber: "#F2FF49",
        violet: "#8A5BFF",
        mint: "#6CFFB0",
        pink: "#FF6AD5",
      },
    },
  },
  plugins: [],
};
