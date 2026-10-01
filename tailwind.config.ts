import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0A08",
        coal: "#14120E",
        cream: "#F6F1E7",
        sand: "#E9E0CE",
        gold: "#C6A15B",
        golddeep: "#9A7B3F",
        stone: {
          50: "#FAF8F3",
          100: "#F3EFE4",
          200: "#E7E0CF",
          300: "#D5CAB0",
          400: "#BCAF8D",
          500: "#9C9071",
          600: "#7E7559",
          700: "#635D47",
          800: "#4C4839",
          900: "#38352B",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
