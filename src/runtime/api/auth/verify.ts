import { H3Error, defineEventHandler, getCookie, getRequestURL, sendError, setHeaders } from 'h3'
import { useGelEnv } from '../../server/composables/useGelEnv'

/**
 * Handles the link in the email verification flow.
 *
 * @param {Request} req
 */
export default defineEventHandler(async (req) => {
  const { urls } = useGelEnv()
  const { authBaseUrl } = urls

  const requestUrl = getRequestURL(req)
  const verification_token = requestUrl.searchParams.get('verification_token')
  if (!verification_token) {
    const err = new H3Error(`Verify request is missing 'verification_token' search param. The verification email is malformed.`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const verifier = getCookie(req, 'gel-pkce-verifier')
  if (!verifier) {
    const err = new H3Error(`Could not find 'verifier' in the cookie store. Is this the same user agent/browser that started the authorization flow?`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const verifyUrl = new URL('verify', authBaseUrl)
  const verifyResponse = await fetch(verifyUrl.href, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      verification_token,
      verifier,
      provider: 'builtin::local_emailpassword',
    }),
  })

  if (!verifyResponse.ok) {
    const err = new H3Error(await verifyResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const { code } = await verifyResponse.json()

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

  setHeaders(req, {
    'Set-Cookie': `gel-auth-token=${tokenResponseData.auth_token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
  })

  return tokenResponseData
})
