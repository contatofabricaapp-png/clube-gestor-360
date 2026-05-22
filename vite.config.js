import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { deny: ['_legado'] }
  },
  optimizeDeps: {
    exclude: []
  },
  build: {
    rollupOptions: {
      input: { main: './index.html' }
    }
  }
})
