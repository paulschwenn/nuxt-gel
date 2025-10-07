import { H3Error, defineEventHandler, isMethod, readBody, sendError, setHeaders } from 'h3'
import { useGelPKCE } from '../../server/composables/useGelPKCE'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

/**
 * Request a password reset for an email.
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

  const pkce = useGelPKCE()
  const { authBaseUrl, resetPasswordUrl: reset_url } = resolveAuthEnv()

  if (!authBaseUrl) {
    const err = new H3Error('Auth base URL is not configured')
    err.statusCode = 500
    return sendError(req, err)
  }

  const { email } = await readBody(req)
  const provider = 'builtin::local_emailpassword'

  if (!email) {
    const err = new H3Error(`Request body is missing 'email'`)
    err.statusCode = 400
    return sendError(req, err)
  }

  const sendResetUrl = new URL('send-reset-email', authBaseUrl)
  const sendResetResponse = await fetch(sendResetUrl.href, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      provider,
      reset_url,
      challenge: pkce.challenge,
    }),
  })

  if (!sendResetResponse.ok) {
    const err = new H3Error(await sendResetResponse.text())
    err.statusCode = 400
    return sendError(req, err)
  }

  const { email_sent } = await sendResetResponse.json()

  const secureFlag = (resolveAuthEnv().appUrl?.startsWith('https://') ? '; Secure' : '')
  setHeaders(
    req,
    {
      'Set-Cookie': `gel-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; SameSite=Strict${secureFlag}`,
    },
  )

  return {
    message: `Reset email sent to '${email_sent}'.`,
  }
})
