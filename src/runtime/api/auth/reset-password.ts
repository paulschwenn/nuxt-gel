import { H3Error, defineEventHandler, getCookie, isMethod, readBody, sendError, setHeaders } from 'h3'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

/**
 * Send new password with reset token to Gel Auth.
 *
 * @param {Request} req
 */
export default defineEventHandler(async (req) => {
  // Enforce POST for body parsing to avoid 405 from readBody on GET
  if (!isMethod(req, 'POST')) {
    const err = new H3Error('Method Not Allowed')
    err.statusCode = 405
    setHeaders(req, { Allow: 'POST' })
    return sendError(req, err)
  }

  const { authBaseUrl } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }
  const { reset_token, password } = await readBody(req)

  if (!reset_token || !password) {
    const err = new H3Error(`Request body malformed. Expected JSON body with 'reset_token' and 'password' keys.`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const provider = 'builtin::local_emailpassword'
  const verifier = getCookie(req, 'gel-pkce-verifier')
  if (!verifier) {
    const err = new H3Error(`Could not find 'verifier' in the cookie store. Is this the same user agent/browser that started the authorization flow?`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const resetUrl = new URL('reset-password', authBaseUrl)
  const resetResponse = await fetch(resetUrl.href, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reset_token,
      provider,
      password,
    }),
  })

  if (!resetResponse.ok) {
    const err = new H3Error(await resetResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const { code } = await resetResponse.json()
  const tokenUrl = new URL('token', authBaseUrl)
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('verifier', verifier)
  const tokenResponse = await fetch(tokenUrl.href, {
    method: 'get',
  })

  if (!tokenResponse.ok) {
    const err = new H3Error(await tokenResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const tokenResponseData = await tokenResponse.json()
  const secureFlag = (resolveAuthEnv().appUrl?.startsWith('https://') ? '; Secure' : '')
  setHeaders(req, {
    'Set-Cookie': `gel-auth-token=${tokenResponseData.auth_token}; HttpOnly; Path=/; SameSite=Strict${secureFlag}`,
  })

  return tokenResponseData
})
