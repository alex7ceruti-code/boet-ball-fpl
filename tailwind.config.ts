import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#007A3D", // Springbok green
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        springbok: {
          DEFAULT: "#007A3D", // Official Springbok green
          green: "#007A3D",
          gold: "#FFB81C", // Official Springbok gold
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        'sa-gold': {
          DEFAULT: "#eab308",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
        },
        fdr: {
          1: "#00FF87", // Very easy - bright green
          2: "#7ED321", // Easy - green  
          3: "#F5A623", // Moderate - yellow
          4: "#FF6900", // Difficult - orange
          5: "#D0021B", // Very difficult - red
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
      },
      fontFamily: {
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'accent': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'springbok-spin': 'springbok-spin 1s linear infinite',
        'bounce-gentle': 'bounce-gentle 1s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'springbok-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-gentle': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(22, 163, 74, 0.1)',
        'premium-lg': '0 10px 40px rgba(22, 163, 74, 0.15)',
        'springbok': '0 2px 4px rgba(22, 163, 74, 0.2)',
        'springbok-lg': '0 4px 8px rgba(22, 163, 74, 0.3)',
        'sa-gold': '0 2px 4px rgba(234, 179, 8, 0.2)',
        'sa-gold-lg': '0 4px 8px rgba(234, 179, 8, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
