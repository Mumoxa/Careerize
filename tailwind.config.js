/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo"', 'ui-sans-serif', 'system-ui'],
        sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        surfacePrimary: "#121614",
        surfaceRaised: "#1A211D",
        line: "#2D352F",
        textEmphasis: "#F5F1E8",
        textMuted: "#C8C0B2",
        textSubtle: "#918B80",
        textQuiet: "#6F6A61",
        interactionPrimary: "#E7B44A",
        feedbackSuccess: "#8EA56D",
        feedbackRisk: "#B86B5D",
        clay: "#8F4F38",
        ink: "#121614",
        cyber: "#E7B44A",
        mint: "#8EA56D",
        pink: "#B86B5D",
      },
    },
  },
  plugins: [],
};
