/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./*.php',
		'./inc/**/*.php',
		'./parts/**/*.html',
		'./patterns/**/*.php',
		'./templates/**/*.html',
		'./assets/src/js/**/*.js',
		'../../plugins/grosharp-core/grosharp-core.php',
		'../../plugins/grosharp-core/src/**/*.php',
		'../../plugins/grosharp-core/includes/**/*.php',
		'../../plugins/grosharp-core/build/blocks/**/*.php',
		'../../plugins/grosharp-core/src/**/*.{js,jsx,ts,tsx}'
	],
	theme: {
		extend: {
			colors: {
				brand: {
					primary: 'var(--grosharp-primary)',
					accent: 'var(--grosharp-accent)',
					dark: 'var(--grosharp-dark)',
					ink: 'var(--grosharp-ink)',
					muted: 'var(--grosharp-muted)',
					surface: 'var(--grosharp-surface)',
					soft: 'var(--grosharp-soft)'
				}
			},
			fontFamily: {
				body: ['var(--grosharp-font-body)', 'Switzer', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				heading: ['var(--grosharp-font-heading)', 'Inter Display', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				panel: '1.5rem',
				control: '999px'
			},
			boxShadow: {
				panel: '0 24px 80px rgba(11, 16, 32, 0.10)'
			}
		}
	},
	plugins: []
};
