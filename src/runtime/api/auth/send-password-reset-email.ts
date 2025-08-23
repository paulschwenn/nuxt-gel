import { H3Error, defineEventHandler, readBody, sendError, setHeaders } from 'h3'
import { useGelEnv } from '../../server/composables/useGelEnv'
import { useGelPKCE } from '../../server/composables/useGelPKCE'

/**
 * Request a password reset for an email.
 *
 * @param {Request} req
 */
export default defineEventHandler(async (req) => {
  const pkce = useGelPKCE()
  const { urls } = useGelEnv()
  const { authBaseUrl, resetPasswordUrl: reset_url } = urls

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

  setHeaders(
    req,
    {
      'Set-Cookie': `gel-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
    },
  )

  return {
    message: `Reset email sent to '${email_sent}'.`,
  }
})
