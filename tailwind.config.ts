import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0e1830",
        panel: "#16233f",
        line: "#2a3a5c",
        ink: "#eef1f7",
        muted: "#9aa7c0",
        acid: "#c9a961",
        gold: "#c9a961",
        navy: "#1b2a4a",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        pulse2: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        pulse2: "pulse2 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
