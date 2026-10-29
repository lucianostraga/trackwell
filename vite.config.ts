import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * The public base path comes from BASE_PATH so the same build works at the site
 * root, at /trackwell/ (production) and at /trackwell/preview/pr-<n>/ (previews).
 */
function normalizeBase(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim().replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? '/' : `/${trimmed}/`
}

/**
 * Emits dist/version.json with the build metadata. CI polls it to know when a
 * GitHub Pages deployment is actually live before posting the preview link.
 */
function versionManifest(base: string): Plugin {
  return {
    name: 'build-version-manifest',
    apply: 'build',
    generateBundle() {
      const env = process.env
      const manifest = {
        sha: env.VITE_BUILD_SHA || 'local',
        builtAt: env.VITE_BUILD_TIME || 'local',
        env: env.VITE_ENV || 'local',
        previewLabel: env.VITE_PREVIEW_LABEL || null,
        base,
      }
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      })
    },
  }
}

const base = normalizeBase(process.env.BASE_PATH)

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), versionManifest(base)],
  build: {
    target: 'es2023',
    sourcemap: true,
  },
})
