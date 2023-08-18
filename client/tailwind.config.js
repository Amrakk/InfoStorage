/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
        aesthetic: "0 3px 10px rgba(0,0,0,0.2)",
      },

      colors: {
        primary: "#415245",
      },
    },
  },
  plugins: [],
};
