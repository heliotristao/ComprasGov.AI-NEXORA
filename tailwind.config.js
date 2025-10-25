/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/hooks/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/lib/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/stores/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D63C6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0B1C2C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E6EEF9",
          foreground: "#0B1C2C",
        },
        accent: {
          DEFAULT: "#F0F6FF",
          foreground: "#0B1C2C",
        },
      },
    },
  },
  plugins: [],
}
