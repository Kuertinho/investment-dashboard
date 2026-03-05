import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const yahooProxy = {
  '/yahoo-finance': {
    target: 'https://query1.finance.yahoo.com',
    changeOrigin: true,
    headers: { 'User-Agent': 'Mozilla/5.0' },
    rewrite: path => path.replace(/^\/yahoo-finance/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: yahooProxy },
  preview: { proxy: yahooProxy },
})
