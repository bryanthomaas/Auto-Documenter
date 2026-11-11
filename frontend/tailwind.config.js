/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Oceanic Abyss
        'ocean-abyss': 'rgb(var(--ocean-abyss) / <alpha-value>)',
        'ocean-trench': 'rgb(var(--ocean-trench) / <alpha-value>)',
        'ocean-deep': 'rgb(var(--ocean-deep) / <alpha-value>)',
        'ocean-surface': 'rgb(var(--ocean-surface) / <alpha-value>)',
        'ocean-card': 'rgb(var(--ocean-card) / <alpha-value>)',
        'ocean-card-hover': 'rgb(var(--ocean-card-hover) / <alpha-value>)',
        'ocean-card-border': 'var(--ocean-card-border)',

        // Royal Blue
        'royal-blue': 'rgb(var(--royal-blue) / <alpha-value>)',
        'royal-blue-light': 'rgb(var(--royal-blue-light) / <alpha-value>)',
        'royal-blue-glow': 'var(--royal-blue-glow)',
        'royal-blue-tint': 'var(--royal-blue-tint)',

        // Vibrant Cerulean & Ocean Cyan (SVZ)
        'ocean-cyan': 'rgb(var(--ocean-cyan) / <alpha-value>)',
        'cerulean-vibrant': 'rgb(var(--cerulean-vibrant) / <alpha-value>)',
        'cerulean-light': 'rgb(var(--cerulean-light) / <alpha-value>)',
        'cerulean-glow': 'var(--cerulean-glow)',
        'cerulean-tint': 'var(--cerulean-tint)',

        // Liquid Silver
        'silver-base': 'rgb(var(--silver-base) / <alpha-value>)',
        'silver-bright': 'rgb(var(--silver-bright) / <alpha-value>)',
        'silver-shine': 'rgb(var(--silver-shine) / <alpha-value>)',
        'silver-muted': 'rgb(var(--silver-muted) / <alpha-value>)',
        'silver-dark': 'rgb(var(--silver-dark) / <alpha-value>)',
        'silver-border': 'var(--silver-border)',
        'silver-hairline': 'var(--silver-hairline)',

        // Status
        'status-success': 'rgb(var(--status-success) / <alpha-value>)',
        'status-warning': 'rgb(var(--status-warning) / <alpha-value>)',
        'status-error': 'rgb(var(--status-error) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'var(--font-display)', 'Georgia', 'serif'],
        sans: ['Familjen Grotesk', 'var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'ocean-glow': '0 0 25px -5px var(--royal-blue-glow)',
        'cerulean-glow': '0 0 25px -4px var(--cerulean-glow)',
        'silver-glow': '0 0 20px -3px var(--silver-glow)',
        'silver-edge': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.40)',
      }
    },
  },
  plugins: [],
}
