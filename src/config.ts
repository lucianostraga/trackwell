import { resolveBuildInfo } from './lib/build-info'

/** Build metadata for this bundle, resolved once at startup. */
export const BUILD_INFO = resolveBuildInfo(import.meta.env)
