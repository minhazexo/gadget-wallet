/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../packages/ui/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // goribergadget.com header clone — primary red per the header spec
        // (#E60023 / hover #C4001D). Used by the storefront header; the rest of
        // the site keeps its established gw-* palette.
        primary: "#E60023",
        "primary-dark": "#C4001D",
        gw: {
          red: "#e11d2e",
          "red-hover": "#c1121f",
          black: "#111827",
          "gray-700": "#374151",
          "gray-500": "#6b7280",
          "gray-400": "#9ca3af",
          "gray-300": "#d1d5db",
          "gray-200": "#e5e7eb",
          border: "rgb(var(--gw-border) / <alpha-value>)",
          bg: "rgb(var(--gw-bg) / <alpha-value>)",
          white: "#ffffff",
          green: "#16a34a",
          yellow: "#f59e0b",
          footer: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        btn: "12px",
        card: "16px",
        category: "20px",
        product: "24px",
        hero: "24px",
        newsletter: "28px",
      },
      boxShadow: {
        "gw-sm": "0 2px 8px rgba(0,0,0,0.05)",
        "gw-md": "0 6px 16px rgba(0,0,0,0.08)",
        "gw-lg": "0 16px 40px rgba(0,0,0,0.12)",
      },
      maxWidth: {
        container: "1320px",
      },
    },
  },
  plugins: [
    // Safe-area inset utilities — for fixed bottom bars, toasts and the tab bar
    // on notched phones (viewport-fit=cover). Classes: pb-safe, pt-safe,
    // pl-safe, pr-safe, bottom-safe.
    function safeArea({ addUtilities }) {
      addUtilities({
        ".pb-safe": { paddingBottom: "env(safe-area-inset-bottom)" },
        ".pt-safe": { paddingTop: "env(safe-area-inset-top)" },
        ".pl-safe": { paddingLeft: "env(safe-area-inset-left)" },
        ".pr-safe": { paddingRight: "env(safe-area-inset-right)" },
        ".bottom-safe": { bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" },
      });
    },
  ],
};
