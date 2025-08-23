import { H3Error, defineEventHandler, readBody, sendError, setHeaders } from 'h3'
import { useGelEnv } from '../../server/composables/useGelEnv'
import { useGelPKCE } from '../../server/composables/useGelPKCE'

/**
 * Handles sign up with email and password.
 *
 * @param {Request} req
 * @param {Response} res
 */
export default defineEventHandler(async (req) => {
  const pkce = useGelPKCE()
  const { urls } = useGelEnv()
  const { authBaseUrl, verifyRedirectUrl } = urls

  console.log('🔍 [SIGNUP API] Debug Info:')
  console.log('  - urls:', urls)
  console.log('  - authBaseUrl:', authBaseUrl)
  console.log('  - verifyRedirectUrl:', verifyRedirectUrl)
  console.log('  - pkce.challenge:', pkce.challenge)

  const { email, password, provider } = await readBody(req)

  console.log('🔍 [SIGNUP API] Request Body:')
  console.log('  - email:', email)
  console.log('  - password:', password ? '[PRESENT]' : '[MISSING]')
  console.log('  - provider:', provider)

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
    const errorText = await registerResponse.text()
    console.log('🔍 [SIGNUP API] EdgeDB Auth Server Error:')
    console.log('  - Status:', registerResponse.status)
    console.log('  - Status Text:', registerResponse.statusText)
    console.log('  - Response Body:', errorText)
    console.log('  - Request URL:', registerUrl.href)
    console.log('  - Request Body:', JSON.stringify({
      challenge: pkce.challenge,
      email,
      provider,
      password: '[REDACTED]',
      verify_url: verifyRedirectUrl,
    }))
    
    const err = new H3Error(`Error from auth server: ${errorText}`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const registerResponseData = await registerResponse.json()

  setHeaders(req, {
    'Set-Cookie': `edgedb-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
  })

  return registerResponseData
})
