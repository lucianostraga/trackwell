/** Build metadata injected at build time through VITE_* environment variables. */

export type BuildEnvironment = 'production' | 'preview' | 'local'

export interface BuildInfo {
  /** Short commit SHA, or "local". */
  sha: string
  /** ISO timestamp of the build, or "local". */
  builtAt: string
  environment: BuildEnvironment
  /** e.g. "PR #12 · TW-12", only for previews. */
  previewLabel: string | null
}

export interface BuildEnv {
  VITE_BUILD_SHA?: string
  VITE_BUILD_TIME?: string
  VITE_ENV?: string
  VITE_PREVIEW_LABEL?: string
}

const clean = (value: string | undefined) => (value ?? '').trim()

export function resolveBuildInfo(env: BuildEnv): BuildInfo {
  const rawEnv = clean(env.VITE_ENV).toLowerCase()
  const environment: BuildEnvironment =
    rawEnv === 'production' || rawEnv === 'preview' ? rawEnv : 'local'
  const label = clean(env.VITE_PREVIEW_LABEL)
  return {
    sha: clean(env.VITE_BUILD_SHA).slice(0, 12) || 'local',
    builtAt: clean(env.VITE_BUILD_TIME) || 'local',
    environment,
    previewLabel: environment === 'preview' && label !== '' ? label : null,
  }
}

/**
 * Text for the environment badge in the top bar:
 * "Production", "Preview · PR #12" (first segment of the preview label) or "Local".
 */
export function environmentBadgeLabel(info: BuildInfo): string {
  switch (info.environment) {
    case 'production':
      return 'Production'
    case 'preview': {
      const first = info.previewLabel?.split('·')[0]?.trim()
      return first ? `Preview · ${first}` : 'Preview'
    }
    case 'local':
      return 'Local'
  }
}
