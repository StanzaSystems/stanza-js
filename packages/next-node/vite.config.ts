import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'
import { builtinModules } from "module"

export default defineConfig({
  plugins: [eslint(), dts()],
  build: {
    target: 'es2020',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.ts'),
      name: '@getstanza/next-node',
      // the proper extensions will be added
      fileName: 'getstanza-next-node'
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        /^@getstanza\/.*/,
      ],
      output: {
        globals: builtinModules.reduce((g, m) => {
          g[`node:${m}`] = m
          return g
        }, {} as Record<string, string>)
      }
    }
  },
  test: {
    coverage: {
      reporter: [['lcov', {'projectRoot': '../..'}]],
      reportsDirectory: '../../coverage/packages/next-node'
    },
  }
})