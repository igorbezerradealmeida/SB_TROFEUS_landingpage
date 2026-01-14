import { defineConfig } from 'astro/config';

// 1. Importe AMBAS as integrações
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // 2. Adicione AMBAS na lista de integrações
  integrations: [
    tailwind(), 
    react()
  ]
});