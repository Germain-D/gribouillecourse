/** @type {import('tailwindcss').Config} */
export default {
  content: [], // Assurez-vous de spécifier ici vos fichiers source (par exemple: ["./src/**/*.{js,jsx,ts,tsx,vue}"])
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        stravaTheme: {
          "primary": "#FC4C02",
          "primary-focus": "#E34400",
          "primary-content": "#FFFFFF",
          
          "secondary": "#6D6D78",
          "secondary-focus": "#5D5D68",
          "secondary-content": "#FFFFFF",
          
          "accent": "#242428",
          "accent-focus": "#000000",
          "accent-content": "#FFFFFF",
          
          "neutral": "#F7F7FA",
          "neutral-focus": "#DFDFE8",
          "neutral-content": "#242428",
          
          "base-100": "#FFFFFF",
          "base-200": "#F7F7FA",
          "base-300": "#DFDFE8",
          "base-content": "#242428",
          
          "info": "#3ABFF8",
          "success": "#1EB854",
          "warning": "#FBBD23",
          "error": "#FC4C02",
        },
      },
    ],
    defaultTheme: "stravaTheme", // Pour définir ce thème comme thème par défaut
  },
}