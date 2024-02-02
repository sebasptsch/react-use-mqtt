import GithubActionsReporter from 'vitest-github-actions-reporter'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTest.tsx'],
    testTimeout: 10000,
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', new GithubActionsReporter()]
      : 'default'
  },
})