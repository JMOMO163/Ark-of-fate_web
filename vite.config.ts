import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.js', '.ts', '.vue']
  },
  server: {
    port: 8001,
    open: true,
    allowedHosts: [
      'uk.frp.one',
      'shui.wangwang351.asia',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://uk.frp.one:58023',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        timeout: 30000,
        ws: true
      }
    }
  }
}) 