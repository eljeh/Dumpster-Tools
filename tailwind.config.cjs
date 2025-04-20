/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
		"./src/**/*.{html,js}",
		"./node_modules/tw-elements/dist/js/**/*.js"],
	theme: {
		extend: {},
	},
	plugins: [require("tw-elements/dist/plugin.cjs")],
}
