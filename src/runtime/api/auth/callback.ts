import { H3Error, defineEventHandler, getCookie, getRequestURL, sendError, setHeaders } from 'h3'
import { useNitroApp } from 'nitropack/runtime'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

/**
 * Handles the PKCE callback and exchanges the `code` and `verifier`
 * for an auth_token, setting the auth_token as an HttpOnly cookie.
 *
 * @param {Request} req
 */
export default defineEventHandler(async (req) => {
  const { authBaseUrl, appUrl } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }

  const requestUrl = getRequestURL(req)
  const code = requestUrl.searchParams.get('code')
  if (!code) {
    const error = requestUrl.searchParams.get('error')
    const err = new H3Error(`OAuth callback is missing 'code'. OAuth provider responded with error: ${error}`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const verifier = getCookie(req, 'gel-pkce-verifier')
  if (!verifier) {
    const err = new H3Error(`Could not find 'verifier' in the cookie store. Is this the same user agent/browser that started the authorization flow?`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const codeExchangeUrl = new URL('token', authBaseUrl)
  codeExchangeUrl.searchParams.set('code', code)
  codeExchangeUrl.searchParams.set('verifier', verifier)
  const codeExchangeResponse = await fetch(codeExchangeUrl.href, {
    method: 'GET',
  })

  if (!codeExchangeResponse.ok) {
    const err = new H3Error(await codeExchangeResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const codeExchangeResponseData = await codeExchangeResponse.json()

  await useNitroApp().hooks.callHook(
    'gel:auth:callback' as any,
    {
      code,
      verifier,
      codeExchangeUrl,
      codeExchangeResponseData,
    },
  )

  const secureFlag = (appUrl?.startsWith('https://') ? '; Secure' : '')
  setHeaders(req, {
    'Set-Cookie': `gel-auth-token=${codeExchangeResponseData.auth_token}; Path=/; HttpOnly${secureFlag}`,
  })
})
