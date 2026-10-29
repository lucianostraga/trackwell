import { fileURLToPath } from 'node:url'

/** Where screenshots and videos for reviewers go (see `npm run evidence`). */
export const EVIDENCE_DIR = fileURLToPath(new URL('../../evidence/', import.meta.url))
