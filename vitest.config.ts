import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Reuses the Vite config (Vue plugin + `@` -> src alias) so unit tests
// resolve modules exactly like the app does.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests/unit/**/*.spec.ts'],
      globals: false,
      clearMocks: true
    }
  })
)
