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
          DEFAULT: "#0D63C6", // Azul do ícone
          foreground: "#FFFFFF",
          50: "#E6F0FF",
          100: "#C9DFFE",
          200: "#94C1FC",
          300: "#5F9CF5",
          400: "#337AE8",
          500: "#0D63C6",
          600: "#0A4FA2",
          700: "#083F81",
          800: "#052E5C",
          900: "#031E3D",
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
