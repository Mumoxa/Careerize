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
        clay: {
          400: "#C97B5A",
          500: "#B8623F",
          600: "#9C4E2F",
        },
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
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(16, 36, 28, 0.06), 0 1px 1px rgba(16, 36, 28, 0.04)",
        "elevation-2": "0 8px 24px rgba(16, 36, 28, 0.08), 0 2px 6px rgba(16, 36, 28, 0.05)",
        "elevation-3": "0 24px 56px rgba(16, 36, 28, 0.12), 0 6px 16px rgba(16, 36, 28, 0.06)",
        "elevation-selected": "0 0 0 1.5px rgba(47, 82, 63, 0.9), 0 12px 28px rgba(16, 36, 28, 0.14)",
      },
    },
  },
  plugins: [],
};
