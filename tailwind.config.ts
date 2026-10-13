import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flipkart: {
          blue: "#2874f0",
          yellow: "#ff9f00",
          darkblue: "#0047b3",
          green: "#388e3c",
          lightgray: "#f1f3f6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
