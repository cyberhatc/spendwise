/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f2ff",
          100: "#e9e5ff",
          200: "#d6cffd",
          300: "#b3a6fa",
          400: "#8f7cf5",
          500: "#6c63ff",
          600: "#5a4ff0",
          700: "#4937c9",
          800: "#3a2da6",
          900: "#2e227f",
        },
        violet: {
          50: "#f5f3ff",
          100: "#ebe7ff",
          200: "#d6ccff",
          300: "#b3a3f8",
          400: "#8f74f5",
          500: "#7a5cf0",
          600: "#6c43e8",
        },
        ink: {
          900: "#171134",
          800: "#221947",
          700: "#2f2a63",
          600: "#4a448a",
          500: "#6b639f",
        },
        surface: "#fbfaff",
        lavender: "#f6f4ff",
        mist: "#efedfb",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(39, 32, 96, 0.04), 0 8px 24px -12px rgba(39, 32, 96, 0.12)",
        cardHover: "0 2px 4px rgba(39, 32, 96, 0.05), 0 16px 40px -16px rgba(39, 32, 96, 0.22)",
        soft: "0 4px 14px -6px rgba(76, 60, 170, 0.25)",
      },
      borderRadius: {
        xl: "18px",
        lg: "16px",
        md: "14px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease both",
        "fade-in": "fade-in 0.3s ease both",
      },
    },
  },
  plugins: [],
};
module.exports = {
  ...module.exports,
};
