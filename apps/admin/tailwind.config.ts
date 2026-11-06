import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Primary (Brand) ─── */
        primary: {
          DEFAULT: "#43abff",
          dark: "#3384c6",
          light: "#b9e0ff",
          lightest: "#e8f5fe",
          foreground: "hsl(var(--primary-foreground))",
        },

        /* ─── Surface ── */
        surface: "var(--color-surface)",

        /* ─── Special (Sections) ─── */
        visa: { DEFAULT: "#ee1500", hover: "#ff7800" },
        tour: { DEFAULT: "#fba834", hover: "#ff7800" },

        /* ─── Text ─── */
        "text-strong": "var(--color-text-strong)",
        "text": "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-subtle": "var(--color-text-subtle)",

        /* ─── Background ─── */
        "bg": "var(--color-bg)",
        "bg-sec": "var(--color-bg-sec)",

        /* ─── Borders & Dividers ─── */
        divider: "var(--color-divider)",

        /* ─── State Colors ─── */
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#0ea5b6",

        /* ─── shadcn semantic tokens (dark-mode aware) ─── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /* ─── Border Radius System (۶ سطح) ─── */
      borderRadius: {
        xs: "6px",    // بج‌های خیلی کوچک
        sm: "8px",    // دکمه‌ها
        md: "12px",   // inputها، chips، بج‌ها
        lg: "16px",   // کارت‌ها
        xl: "20px",   // سکشن‌ها، modals (سقف مجاز)
        "2xl": "24px", // فقط hero/overlays
      },

      /* ─── Shadows ── */
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)",
        "card-hover": "0 12px 24px rgba(16, 24, 40, 0.08), 0 4px 8px rgba(16, 24, 40, 0.04)",
        modal: "0 -10px 30px rgba(0, 0, 0, 0.25)",
        sm: "0 2px 4px rgba(0, 0, 0, 0.04)",
        lg: "0 20px 40px rgba(0, 0, 0, 0.12)",
      },

      /* ─── Fonts ─── */
      fontFamily: {
        sans: ['"IRANSansX"', "Inter", "system-ui", "sans-serif"],
        display: ['"IRANSansX"', "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },

      /* ─── Container ─── */
      maxWidth: {
        "container-2xl": "1280px",
      },

      /* ─── Animations ─── */
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translate3d(0, 80px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translate3d(-64px, 0, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        nsSheetIn: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        nsFadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        nsHistoryIn: {
          from: { transform: "translate3d(-100%, 0, 0)", opacity: "0.4" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 600ms ease forwards",
        "fade-in-right": "fadeInRight 600ms ease forwards",
        "slide-down": "slideDown 300ms ease forwards",
        "ns-sheet": "nsSheetIn 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        "ns-fade": "nsFadeIn 0.25s ease-out both",
        "ns-history": "nsHistoryIn 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
