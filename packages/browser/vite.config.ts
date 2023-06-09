import { defineConfig } from 'vitest/config'

import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/browser',

  plugins: [
    viteTsConfigPaths({
      root: '../../'
    })
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest'
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: [['lcov', { projectRoot: '.' }]],
      reportsDirectory: '../../coverage/packages/browser'
    }
  }
})
