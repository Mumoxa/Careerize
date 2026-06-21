/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#05060A",
        cyber: "#F2FF49",
        violet: "#8A5BFF",
        mint: "#6CFFB0",
        pink: "#FF6AD5",
        cream: {
          50: "#FFFDF7",
          100: "#FAF5E9",
          200: "#F1E8D5",
          300: "#E5D8BE",
        },
        sage: {
          50: "#F3F7F0",
          100: "#E3EEDF",
          200: "#CBDDC5",
          300: "#A9C59F",
          400: "#85AA7B",
        },
        forest: {
          50: "#F0F7F2",
          100: "#DDEBDF",
          200: "#BED4C2",
          300: "#98B7A0",
          400: "#6F997E",
          500: "#4F7C63",
          600: "#3D664F",
          700: "#2F523F",
          800: "#244234",
          900: "#193126",
          950: "#10241C",
        },
      },
    },
  },
  plugins: [],
};
