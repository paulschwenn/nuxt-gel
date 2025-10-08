import { H3Error, defineEventHandler, isMethod, readBody, sendError, setCookie, setHeaders } from 'h3'
import { useGelPKCE } from '../../server/composables/useGelPKCE'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

export default defineEventHandler(async (req) => {
  const DEBUG = process.env.NUXT_GEL_DEBUG === '1' || process.env.NUXT_GEL_DEBUG === 'true'
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
    if (DEBUG)
      console.error('[gel:auth:login] Missing authBaseUrl. Check Gel DSN/urls config.')
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }

  // console.log('🔍 [LOGIN API] Debug Info:')
  // console.log('  - authBaseUrl:', authBaseUrl)
  // console.log('  - pkce.challenge:', pkce.challenge)

  const { email, password, provider } = await readBody(req)
  if (DEBUG) {
    const redactedEmail = typeof email === 'string' && email.includes('@')
      ? `${email.split('@')[0]?.slice(0, 2)}***@${email.split('@')[1]}`
      : undefined
    console.log('[gel:auth:login] Request body (redacted):', {
      email: redactedEmail,
      hasPassword: !!password,
      provider,
    })
  }

  if (!email || !password || !provider) {
    const err = new H3Error(`Request body malformed. Expected JSON body with 'email', 'password', and 'provider' keys, but got: ${Object.entries({ email, password, provider }).filter(([, v]) => !!v)}`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const authenticateUrl = new URL('authenticate', authBaseUrl)
  let authenticateResponse: Response
  try {
    authenticateResponse = await fetch(authenticateUrl.href, {
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
  }
  catch (e: any) {
    if (DEBUG)
      console.error('[gel:auth:login] authenticate fetch failed:', e?.message || e)
    const err = new H3Error('Failed to reach Gel auth authenticate endpoint')
    err.statusCode = 502
    return sendError(req, err)
  }

  if (!authenticateResponse.ok) {
    const body = await authenticateResponse.text()
    if (DEBUG)
      console.error('[gel:auth:login] authenticate error:', authenticateResponse.status, body)
    const err = new H3Error(body)
    err.statusCode = 400
    return sendError(req, err)
  }

  const authenticateResponseData = await authenticateResponse.json()

  const tokenUrl = new URL('token', authBaseUrl)
  tokenUrl.searchParams.set('code', authenticateResponseData.code)
  tokenUrl.searchParams.set('verifier', pkce.verifier)
  let tokenResponse: Response
  try {
    tokenResponse = await fetch(tokenUrl.href, {
      method: 'get',
    })
  }
  catch (e: any) {
    if (DEBUG)
      console.error('[gel:auth:login] token fetch failed:', e?.message || e)
    const err = new H3Error('Failed to reach Gel auth token endpoint')
    err.statusCode = 502
    return sendError(req, err)
  }

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text()
    if (DEBUG)
      console.error('[gel:auth:login] token error:', tokenResponse.status, body)
    const err = new H3Error(body)
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
