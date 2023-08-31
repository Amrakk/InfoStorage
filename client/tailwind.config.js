/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        ping: {
          "75%, 100%": {
            transform: "scale(1.5)",
            opacity: 0,
          },
        },
      },
      boxShadow: {
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
        aesthetic: "0 3px 10px rgba(0,0,0,0.2)",
      },

      colors: {
        primary: "rgb(65, 82, 69)",
      },
    },
  },
  plugins: [],
};
