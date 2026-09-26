/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#714B67",
          50: "#F6F1F5",
          100: "#EDE3EB",
          200: "#D9C4D3",
          300: "#C4A5BC",
          400: "#9C6F91",
          500: "#714B67",
          600: "#5B3C53",
          700: "#452D3F",
          800: "#301F2C",
          900: "#1A1018",
        },
        surface: "#FFFFFF",
        canvas: "#F7F6F8",
        border: "#E6E1E5",
        success: "#28A745",
        warning: "#F5A623",
        danger: "#E14B4B",
        info: "#3B82C4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 8px rgba(113,75,103,0.06)",
        popover: "0 8px 24px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0, transform: "translateY(4px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(-8px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        slideIn: "slideIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
