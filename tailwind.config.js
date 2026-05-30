/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#05060A",
        cyber: "#F2FF49",
        violet: "#8A5BFF",
        mint: "#6CFFB0",
        pinky: "#FF6AD5",
      },
    },
  },
  plugins: [],
};
