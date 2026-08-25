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
        // Palette recolorée en violet néon — les mêmes noms de classe
        // (indigo-900, etc.) sont utilisés partout dans le site, donc ce
        // changement de teinte suffit à transformer toute l'identité visuelle.
        indigo: {
          950: "#120A2E",
          900: "#1E0A45",
          800: "#3B1373",
        },
        // Nouvel accent néon (violet vif → magenta), pour les halos,
        // boutons, dégradés et éléments "vidéos courtes".
        neon: {
          300: "#E9D5FF",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
        },
        neonpink: {
          400: "#F472F0",
          500: "#E930FF",
          600: "#C026D3",
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
        "gradient-neon":
          "linear-gradient(135deg, #7E22CE 0%, #A855F7 45%, #E930FF 100%)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 12px rgba(168,85,247,0.55), 0 0 28px rgba(233,48,255,0.28)",
          },
          "50%": {
            boxShadow:
              "0 0 22px rgba(168,85,247,0.85), 0 0 48px rgba(233,48,255,0.5)",
          },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-14px) translateX(8px)" },
        },
        marqueeSlide: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        flameGlow: {
          "0%, 100%": {
            boxShadow:
              "0 0 14px rgba(242,169,59,0.55), 0 0 30px rgba(215,38,61,0.30), inset 0 0 18px rgba(242,169,59,0.12)",
          },
          "50%": {
            boxShadow:
              "0 0 24px rgba(242,169,59,0.85), 0 0 52px rgba(215,38,61,0.5), inset 0 0 26px rgba(242,169,59,0.2)",
          },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out both",
        "glow-pulse": "glowPulse 2.6s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "marquee-slide": "marqueeSlide 18s linear infinite",
        "flame-glow": "flameGlow 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
