import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0f2942",
          orange: "#e85d04",
        },
      },
    },
  },
  plugins: [],
};

export default config;
