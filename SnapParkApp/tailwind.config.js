/** @type {import('tailwindcss').Config} */
// tailwind.config.js

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./Screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      flexGrow: {
        1: 1,
        1.5: 1.5,
        2: 2,
        2.5: 2.5,
        3: 3,
        3.5: 3.5,
        4: 4,
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
