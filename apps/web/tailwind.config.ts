import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gw: {
          red: "#e11d2e",
          "red-hover": "#c1121f",
          black: "#111827",
          "gray-700": "#374151",
          "gray-500": "#6b7280",
          "gray-300": "#d1d5db",
          border: "#e5e7eb",
          bg: "#f8fafc",
          white: "#ffffff",
          green: "#16a34a",
          yellow: "#f59e0b",
          footer: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "btn": "12px",
        "category": "20px",
        "product": "24px",
        "hero": "24px",
        "newsletter": "28px",
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
  plugins: [],
} satisfies Config;
