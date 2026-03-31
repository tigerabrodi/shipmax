import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src') + '/',
      '@convex/': path.resolve(__dirname, './convex') + '/',
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
