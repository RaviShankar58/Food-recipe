import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // local /api/llm -> https://apifreellm.com/api/v1/completion
      '/api/llm': {
        target: 'https://apifreellm.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/llm/, '/api/chat'),
      },
    },
  },
})
