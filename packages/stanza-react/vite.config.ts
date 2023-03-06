import { resolve } from 'path'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [eslint(), dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.ts'),
      name: '@getstanza/react',
      // the proper extensions will be added
      fileName: 'getstanza-react'
    },
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', '@getstanza/core', '@getstanza/browser'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React'
        }
      }
    }
  }
})
