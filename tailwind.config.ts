import type { Config } from "tailwindcss";

// These tokens style the contact form, which sits on the dark pine section.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0e2a20",
        panel: "#143629",
        line: "#2d5846",
        ink: "#f2f4ef",
        muted: "#a7bbb0",
        acid: "#3ddc84",
      },
    },
  },
  plugins: [],
};

export default config;
