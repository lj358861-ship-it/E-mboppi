import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          950: "#0F1E3D",
          900: "#16274F",
          800: "#1D3461",
        },
        mango: {
          400: "#F5B94C",
          500: "#F2A93B",
          600: "#E0912A",
        },
        piment: {
          500: "#D7263D",
          600: "#B81E32",
        },
        feuille: {
          500: "#2E8B57",
          600: "#256F46",
        },
        stone: {
          50: "#FAFAF8",
          100: "#F2F1EC",
          200: "#E4E2D8",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
