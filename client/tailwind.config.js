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
                updown: {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(10px)" },
                    "100%": { transform: "translateY(0px)" },
                },
            },
            boxShadow: {
                "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
                aesthetic: "0 3px 10px rgba(0,0,0,0.2)",
            },

            colors: {
                primary: "rgb(65, 82, 69)",
                second: "rgb(106, 175, 199)",
                accent1: "rgb(210, 15, 15)",
            },
            animation: {
                updown1: "updown 1s ease-in-out infinite",
                updown2: "updown 1s ease-in-out infinite 150ms",
                updown3: "updown 1s ease-in-out infinite 300ms",
            },
            screens: {
                xs: "425px",
            },
        },
        safelist: ["animate-[fade-in_1s_ease-in-out]", "animate-[fade-in-down_1s_ease-in-out]"],
    },
    plugins: [],
};
