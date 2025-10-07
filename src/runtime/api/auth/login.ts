import { H3Error, defineEventHandler, isMethod, readBody, sendError, setCookie, setHeaders } from 'h3'
import { useGelPKCE } from '../../server/composables/useGelPKCE'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

export default defineEventHandler(async (req) => {
  // Enforce POST for body parsing to avoid 405 from readBody on GET
  if (!isMethod(req, 'POST')) {
    const err = new H3Error('Method Not Allowed')
    err.statusCode = 405
    setHeaders(req, { Allow: 'POST' })
    return sendError(req, err)
  }

  const pkce = useGelPKCE()
  const { authBaseUrl, appUrl } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }

  // console.log('🔍 [LOGIN API] Debug Info:')
  // console.log('  - authBaseUrl:', authBaseUrl)
  // console.log('  - pkce.challenge:', pkce.challenge)

  const { email, password, provider } = await readBody(req)

  if (!email || !password || !provider) {
    const err = new H3Error(`Request body malformed. Expected JSON body with 'email', 'password', and 'provider' keys, but got: ${Object.entries({ email, password, provider }).filter(([, v]) => !!v)}`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const authenticateUrl = new URL('authenticate', authBaseUrl)
  const authenticateResponse = await fetch(authenticateUrl.href, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challenge: pkce.challenge,
      email,
      password,
      provider,
    }),
  })

  if (!authenticateResponse.ok) {
    const err = new H3Error(await authenticateResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const authenticateResponseData = await authenticateResponse.json()

  const tokenUrl = new URL('token', authBaseUrl)
  tokenUrl.searchParams.set('code', authenticateResponseData.code)
  tokenUrl.searchParams.set('verifier', pkce.verifier)
  const tokenResponse = await fetch(tokenUrl.href, {
    method: 'get',
  })

  if (!tokenResponse.ok) {
    const err = new H3Error(await tokenResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const tokenResponseData = await tokenResponse.json()

  setCookie(req, 'gel-auth-token', tokenResponseData.auth_token, {
    httpOnly: true,
    path: '/',
    secure: appUrl?.startsWith('https://') || false,
    sameSite: true,
  })

  return tokenResponseData
})
