/** URLs for files in public/, which must include the deploy base path (/, /trackwell/, /trackwell/preview/pr-<n>/). */

/** Joins the Vite base path and a public file: withBase('/trackwell/', 'logo.png') -> '/trackwell/logo.png'. */
export function withBase(base: string, file: string): string {
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${file.replace(/^\/+/, '')}`
}

/** A public/ file under this build's base path. */
export function publicAsset(file: string): string {
  return withBase(import.meta.env.BASE_URL ?? '/', file)
}
