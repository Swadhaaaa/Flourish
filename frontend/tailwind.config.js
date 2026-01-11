/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f0814",
                surface: "#1d1424",
                primary: {
                    DEFAULT: "#eeb4b4", // Soft pink from button
                    foreground: "#1a0b1c",
                },
                secondary: {
                    DEFAULT: "#2d2432",
                    foreground: "#ffffff",
                },
                muted: "#8a8192",
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'glow-gradient': 'radial-gradient(circle at 50% -20%, #4a2b45 0%, #0f0814 70%)',
            }
        },
    },
    plugins: [],
}
