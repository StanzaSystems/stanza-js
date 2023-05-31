import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'
import { builtinModules } from 'module'

export default defineConfig({
  plugins: [eslint(), dts()],
  build: {
    target: 'es2020',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.ts'),
      name: '@getstanza/node',
      // the proper extensions will be added
      fileName: 'getstanza-node'
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        /^@opentelemetry\/.*/,
        '@grpc/grpc-js',
        'node-fetch',
        'pino'
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
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: [['lcov', {'projectRoot': '../..'}]],
      reportsDirectory: '../../coverage/packages/node',
      exclude: [
        'gen/**',
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
      ]
    },
  }
})
