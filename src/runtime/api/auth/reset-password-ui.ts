import { defineEventHandler, getQuery, setHeaders } from 'h3'
import { useGelEnv } from '../../server/composables/useGelEnv'

/**
 * Render a simple reset password UI
 *
 * @param {Request} req
 */
export default defineEventHandler((req) => {
  const { urls } = useGelEnv()
  const { authBaseUrl } = urls
  const { reset_token } = getQuery(req)

  setHeaders(req, { 'Content-Type': 'text/html; charset=utf-8' })
  return `
    <html>
      <body>
        <form method="POST" action="${authBaseUrl}/reset-password">
          <input type="hidden" name="reset_token" value="${reset_token}">
          <label>
            New password:
            <input type="password" name="password" required>
          </label>
          <button type="submit">Reset Password</button>
        </form>
      </body>
    </html>
  `
})
