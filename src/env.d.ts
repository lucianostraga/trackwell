interface ImportMetaEnv {
  /** Short commit SHA of the build. */
  readonly VITE_BUILD_SHA?: string
  /** ISO timestamp of the build. */
  readonly VITE_BUILD_TIME?: string
  /** "production" | "preview"; anything else is treated as a local build. */
  readonly VITE_ENV?: string
  /** Preview label, e.g. "PR #12 · TW-12". */
  readonly VITE_PREVIEW_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
