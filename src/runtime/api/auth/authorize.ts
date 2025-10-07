import { H3Error, defineEventHandler, getRequestURL, isMethod, sendError, setHeaders } from 'h3'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'
import { useGelPKCE } from '../../server/composables/useGelPKCE'

/**
 * Redirects OAuth requests to Gel Auth OAuth authorize redirect
 * with the PKCE challenge, and saves PKCE verifier in an HttpOnly
 * cookie for later retrieval.
 *
 * @param {Request} req
 */
export default defineEventHandler(async (req) => {
  if (!isMethod(req, 'GET')) {
    const err = new H3Error('Method Not Allowed')
    err.statusCode = 405
    setHeaders(req, { Allow: 'GET' })
    return sendError(req, err)
  }

  const { authBaseUrl, oAuthRedirectUrl } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }
  const requestUrl = getRequestURL(req)
  const provider = requestUrl.searchParams.get('provider')

  if (!provider) {
    const err = new H3Error('Must provide a \'provider\' value in search parameters')
    err.statusCode = 400
    return sendError(req, err)
  }

  const pkce = useGelPKCE()
  const redirectUrl = new URL('authorize', authBaseUrl)
  redirectUrl.searchParams.set('provider', provider)
  redirectUrl.searchParams.set('challenge', pkce.challenge)
  redirectUrl.searchParams.set('redirect_to', oAuthRedirectUrl!)

  setHeaders(
    req,
    {
      'Set-Cookie': `gel-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
    },
  )

  return { redirect: redirectUrl.href }
})
