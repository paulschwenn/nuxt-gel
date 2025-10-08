import { useGelEnv } from '../composables/useGelEnv'

export function resolveAuthEnv() {
  const gel = useGelEnv() as any
  const urls = gel?.urls || {}
  const dsn = gel?.dsn || {}

  const appUrl = urls.appUrl
    || process.env.APP_URL
    || process.env.NUXT_GEL_APP_URL
    || 'http://localhost:3000'

  const branch = process.env.NUXT_GEL_BRANCH
    || process.env.GEL_BRANCH
    || dsn?.database

  const host = dsn?.host || process.env.NUXT_GEL_HOST
  const port = dsn?.port || process.env.NUXT_GEL_PORT

  const authBaseUrl = urls.authBaseUrl
    || (host && port && (branch || dsn?.database)
      ? `http://${host}:${port}/branch/${branch || dsn?.database}/ext/auth/`
      : undefined)

  const verifyRedirectUrl = urls.verifyRedirectUrl || `${appUrl}/auth/verify`
  const resetPasswordUrl = urls.resetPasswordUrl || `${appUrl}/auth/reset-password`
  const oAuthRedirectUrl = urls.oAuthRedirectUrl || `${appUrl}/auth/callback`

  return {
    appUrl,
    authBaseUrl,
    verifyRedirectUrl,
    resetPasswordUrl,
    oAuthRedirectUrl,
  }
}
