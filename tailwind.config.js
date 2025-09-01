/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.{js,jsx,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./App.{js,jsx}",
//     "./app/**/*.{js,jsx}",
//     "./components/**/*.{js,jsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
