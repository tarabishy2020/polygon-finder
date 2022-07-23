import { defineConfig } from 'vite'
import { resolve } from 'path'

const configRoot = resolve(__dirname,"test")

export default defineConfig({
    base: '',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'example','index.html'),
        }
      },
      outDir: './dist',
      emptyOutDir: true
    },
  });