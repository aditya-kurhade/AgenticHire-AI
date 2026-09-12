import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#944a00",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#85522c",
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
        // Custom specification colors
        "surface-container": "#e6eeff",
        "tertiary": "#904d00",
        "on-primary-fixed-variant": "#713700",
        "inverse-on-surface": "#eaf1ff",
        "surface-container-highest": "#d9e3f6",
        "on-tertiary-fixed": "#2f1500",
        "surface-dim": "#d0dbed",
        "tertiary-fixed-dim": "#ffb77d",
        "secondary-container": "#ffbb8c",
        "on-primary-container": "#502600",
        "primary-fixed": "#ffdcc5",
        "primary-fixed-dim": "#ffb783",
        "on-surface-variant": "#564337",
        "on-tertiary-container": "#4f2700",
        "surface-variant": "#d9e3f6",
        "outline-variant": "#dcc1b1",
        "on-surface": "#121c2a",
        "on-secondary-container": "#794823",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-bright": "#f8f9ff",
        "on-secondary-fixed-variant": "#693b17",
        "tertiary-container": "#e48015",
        "surface": "#f8f9ff",
        "on-error-container": "#93000a",
        "tertiary-fixed": "#ffdcc3",
        "error": "#ba1a1a",
        "surface-container-high": "#dee9fc",
        "error-container": "#ffdad6",
        "primary-container": "#e67e22",
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#fcb889",
        "on-primary-fixed": "#301400",
        "inverse-surface": "#27313f",
        "on-background": "#121c2a",
        "secondary-fixed": "#ffdcc6",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed-variant": "#6e3900",
        "on-secondary-fixed": "#301400",
        "on-error": "#ffffff",
        "surface-tint": "#944a00",
        "outline": "#897365",
        "inverse-primary": "#ffb783"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "0.25rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        gutter: "24px",
        md: "24px",
        xl: "64px",
        sm: "16px",
        lg: "40px",
        base: "4px",
        "container-max": "1440px",
        xs: "8px",
        "margin-mobile": "16px",
        "margin-desktop": "48px"
      },
      fontFamily: {
        "headline-sm": ["Inter"],
        "display-lg": ["Inter"],
        "body-lg": ["Inter"],
        "headline-md": ["Inter"],
        "body-sm": ["Inter"],
        "body-md": ["Inter"],
        "label-md": ["Inter"],
        "headline-lg": ["Inter"],
        "label-sm": ["Inter"],
        "headline-lg-mobile": ["Inter"]
      },
      fontSize: {
        "headline-sm": ["20px", { lineHeight: "28px", letterSpacing: "0", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "0", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-sm": ["14px", { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }]
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
