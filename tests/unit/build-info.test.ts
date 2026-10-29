import { describe, expect, it } from 'vitest'
import { environmentBadgeLabel, resolveBuildInfo } from '../../src/lib/build-info'

describe('resolveBuildInfo', () => {
  it('falls back to "local" when nothing is injected', () => {
    expect(resolveBuildInfo({})).toEqual({
      sha: 'local',
      builtAt: 'local',
      environment: 'local',
      previewLabel: null,
    })
  })

  it('reads a production build', () => {
    expect(
      resolveBuildInfo({ VITE_BUILD_SHA: 'a1b2c3d', VITE_BUILD_TIME: '2026-10-29T14:02:00Z', VITE_ENV: 'production' }),
    ).toEqual({ sha: 'a1b2c3d', builtAt: '2026-10-29T14:02:00Z', environment: 'production', previewLabel: null })
  })

  it('keeps the preview label only for previews', () => {
    expect(resolveBuildInfo({ VITE_ENV: 'preview', VITE_PREVIEW_LABEL: ' PR #12 · TW-12 ' }).previewLabel).toBe(
      'PR #12 · TW-12',
    )
    expect(resolveBuildInfo({ VITE_ENV: 'production', VITE_PREVIEW_LABEL: 'PR #12' }).previewLabel).toBeNull()
  })

  it('treats unknown environments as local and normalizes case', () => {
    expect(resolveBuildInfo({ VITE_ENV: 'staging' }).environment).toBe('local')
    expect(resolveBuildInfo({ VITE_ENV: 'PRODUCTION' }).environment).toBe('production')
  })

  it('shortens long SHAs', () => {
    expect(resolveBuildInfo({ VITE_BUILD_SHA: '4f9c2ab0e1d2c3b4a5f6' }).sha).toBe('4f9c2ab0e1d2')
  })
})

describe('environmentBadgeLabel', () => {
  it('labels each environment', () => {
    expect(environmentBadgeLabel(resolveBuildInfo({ VITE_ENV: 'production' }))).toBe('Production')
    expect(environmentBadgeLabel(resolveBuildInfo({}))).toBe('Local')
    expect(
      environmentBadgeLabel(resolveBuildInfo({ VITE_ENV: 'preview', VITE_PREVIEW_LABEL: 'PR #12 · TW-12' })),
    ).toBe('Preview · PR #12')
    expect(environmentBadgeLabel(resolveBuildInfo({ VITE_ENV: 'preview' }))).toBe('Preview')
  })
})
