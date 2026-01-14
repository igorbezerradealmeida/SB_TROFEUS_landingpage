/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      keyframes: { // <-- MUDANÇA AQUI: Adicione estas keyframes
        'pop-once': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }, // Um leve aumento
          '100%': { transform: 'scale(1)' },
        },
        'bounce-once': { // Uma versão mais tradicional de "pulinho"
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-5px)' }, // Pula 5px
        },
      },
      animation: { // <-- MUDANÇA AQUI: Adicione estas animações
        'pop-once': 'pop-once 0.3s ease-out', // Animação mais suave
        'bounce-once': 'bounce-once 0.3s ease-out', // Animação de pulinho
      },
    },
  },
  plugins: [],
};