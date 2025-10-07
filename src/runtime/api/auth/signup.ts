import { H3Error, createError, defineEventHandler, isMethod, readBody, sendError, setHeaders } from 'h3'
import { useGelPKCE } from '../../server/composables/useGelPKCE'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

/**
 * Handles sign up with email and password.
 *
 * @param {Request} req
 * @param {Response} res
 */
export default defineEventHandler(async (req) => {
  // Enforce POST for body parsing to avoid 405 from readBody on GET
  if (!isMethod(req, 'POST')) {
    const err = new H3Error('Method Not Allowed')
    err.statusCode = 405
    setHeaders(req, { Allow: 'POST' })
    return sendError(req, err)
  }

  const pkce = useGelPKCE()
  const { authBaseUrl, verifyRedirectUrl } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }

  // console.log('🔍 [SIGNUP API] Debug Info:')
  // console.log('  - urls:', urls)
  // console.log('  - authBaseUrl:', authBaseUrl)
  // console.log('  - verifyRedirectUrl:', verifyRedirectUrl)
  // console.log('  - pkce.challenge:', pkce.challenge)

  const { email, password, provider } = await readBody(req)

  // console.log('🔍 [SIGNUP API] Request Body:')
  // console.log('  - email:', email)
  // console.log('  - password:', password ? '[PRESENT]' : '[MISSING]')
  // console.log('  - provider:', provider)

  if (!email || !password || !provider) {
    const err = new H3Error(`Request body malformed. Expected JSON body with 'email', 'password', and 'provider' keys, but got: ${Object.entries({ email, password, provider }).filter(([, v]) => !!v)}`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const registerUrl = new URL('register', authBaseUrl)
  const registerResponse = await fetch(registerUrl.href, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challenge: pkce.challenge,
      email,
      provider,
      password,
      verify_url: verifyRedirectUrl,
    }),
  })

  if (!registerResponse.ok) {
    const rawText = await registerResponse.text()
    let parsed: any
    try {
      parsed = rawText ? JSON.parse(rawText) : undefined
    }
    catch {
      // ignore JSON parse error; keep raw text
    }

    // Provide actionable error details without leaking secrets
    const err = createError({
      statusCode: registerResponse.status || 400,
      statusMessage: parsed?.message || parsed?.error || registerResponse.statusText || 'Auth register failed',
      data: {
        reason: parsed ?? rawText ?? 'Unknown error',
        request: {
          // Never include password; include only safe fields
          email,
          provider,
          verify_url: verifyRedirectUrl,
          endpoint: registerUrl.href,
        },
      },
    })

    return sendError(req, err)
  }

  const registerResponseData = await registerResponse.json()

  setHeaders(req, {
    'Set-Cookie': `gel-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
  })

  return registerResponseData
})
