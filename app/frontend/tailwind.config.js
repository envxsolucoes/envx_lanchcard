/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais em azul
        primary: {
          dark: '#0D47A1',
          'medium-dark': '#1565C0',
          medium: '#1976D2', // cor principal
          'medium-light': '#1E88E5',
          light: '#2196F3',
          lightest: '#42A5F5',
        },
        // Cores de fundo e apoio
        background: {
          light: '#E3F2FD',
        },
        secondary: '#039BE5',
        // Cores de alertas e informações
        alert: '#FF5252',
        warning: '#FFA726',
        success: '#66BB6A',
        info: '#5E35B1',
      },
      fontFamily: {
        sans: ['Roboto', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.15)',
        'bottom-nav': '0 -2px 10px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      height: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-85': '85vh',
        'screen-90': '90vh',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // habilita modo escuro
} 