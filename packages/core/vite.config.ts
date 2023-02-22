import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [eslint(), dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'stanza-core',
      // the proper extensions will be added
      fileName: 'stanza-core'
    }
  },
  test: {
    setupFiles: ['./test/setup.ts']
  }
})
