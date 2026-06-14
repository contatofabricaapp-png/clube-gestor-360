import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // expõe na rede local (útil para testar no celular via IP)
    port: 5173,
    fs: { deny: ['_legado'] },
  },
  optimizeDeps: {
    exclude: [],
  },
  build: {
    // Capacitor precisa de assets relativos (sem base absoluta)
    rollupOptions: {
      input: { main: './index.html' },
    },
    // Chunks menores melhoram o tempo de carregamento no mobile
    chunkSizeWarningLimit: 600,
  },
})
