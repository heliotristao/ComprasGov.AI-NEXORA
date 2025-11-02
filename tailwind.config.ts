import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
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
        // Cores Primárias - Design System NEXORA
        primary: {
          DEFAULT: "#1E40AF", // Blue 800
          foreground: "#FFFFFF",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },

        // Cores Neutras
        neutral: {
          DEFAULT: "#64748B", // Slate 500
          foreground: "#FFFFFF",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },

        // Cores de Feedback
        success: {
          DEFAULT: "#16A34A", // Green 600
          foreground: "#FFFFFF",
          100: "#DCFCE7",
          600: "#16A34A",
        },
        warning: {
          DEFAULT: "#EA580C", // Orange 600
          foreground: "#FFFFFF",
          200: "#FED7AA",
          600: "#EA580C",
        },
        error: {
          DEFAULT: "#DC2626", // Red 600
          foreground: "#FFFFFF",
          100: "#FEE2E2",
          600: "#DC2626",
        },
        info: {
          DEFAULT: "#0284C7", // Sky 600
          foreground: "#FFFFFF",
          100: "#E0F2FE",
          600: "#0284C7",
        },

        // Cores de Status
        status: {
          draft: "#6B7280", // Gray 500
          pending: "#F59E0B", // Amber 500
          approved: "#10B981", // Emerald 500
          rejected: "#EF4444", // Red 500
          archived: "#9CA3AF", // Gray 400
        },

        // Cores de Risco
        risk: {
          critical: "#991B1B", // Red 800
          high: "#DC2626", // Red 600
          medium: "#F59E0B", // Amber 500
          low: "#3B82F6", // Blue 500
        },

        // Cores de IA
        ai: {
          DEFAULT: "#8B5CF6", // Violet 500
          foreground: "#FFFFFF",
          100: "#EDE9FE",
          500: "#8B5CF6",
        },

        // Aliases para compatibilidade com shadcn/ui
        background: "#FFFFFF",
        foreground: "#1E293B",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#1E293B",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#1E40AF",
      },

      // Tipografia - Inter como fonte principal
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      // Escala Tipográfica
      fontSize: {
        "display": ["3rem", { lineHeight: "1.2", fontWeight: "700" }], // 48px
        "h1": ["2.25rem", { lineHeight: "1.3", fontWeight: "700" }], // 36px
        "h2": ["1.875rem", { lineHeight: "1.3", fontWeight: "600" }], // 30px
        "h3": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
        "h4": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }], // 20px
        "h5": ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }], // 18px
        "body-large": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }], // 18px
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }], // 16px
        "body-small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }], // 12px
        "overline": ["0.75rem", { lineHeight: "1.4", fontWeight: "600" }], // 12px
      },

      // Espaçamento (escala de 4px)
      spacing: {
        "0": "0px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },

      // Border Radius
      borderRadius: {
        "none": "0px",
        "sm": "4px",
        "md": "6px",
        "lg": "8px",
        "xl": "12px",
        "full": "9999px",
      },

      // Box Shadow
      boxShadow: {
        "sm": "0 1px 2px rgba(0,0,0,0.05)",
        "md": "0 4px 6px rgba(0,0,0,0.07)",
        "lg": "0 10px 15px rgba(0,0,0,0.1)",
        "xl": "0 20px 25px rgba(0,0,0,0.15)",
      },

      // Animações
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
        "slide-out-right": "slide-out-right 0.25s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
      },

      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1rem",
          lg: "1.5rem",
          xl: "1.5rem",
          "2xl": "1.5rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1280px",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
