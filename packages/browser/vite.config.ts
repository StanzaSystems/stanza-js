import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [eslint(), dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.ts'),
      name: '@getstanza/browser',
      // the proper extensions will be added
      fileName: 'getstanza-browser'
    },
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['@getstanza/core'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: '@getstanza/core'
        }
      }
    }
  },
  test: {
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    mockReset: false,
    environment: 'jsdom',
    coverage: {
      reporter: [['lcov', {'projectRoot': '../..'}]],
      reportsDirectory: '../../coverage/packages/browser'
    },
  }
})
