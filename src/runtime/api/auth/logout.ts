import { H3Error, defineEventHandler, getCookie, sendError, setCookie } from 'h3'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

export default defineEventHandler(async (req) => {
  const authToken = getCookie(req, 'gel-auth-token')

  if (!authToken) {
    const err = new H3Error('Not logged in')
    err.statusCode = 401
    return sendError(req, err)
  }

  const { appUrl } = resolveAuthEnv()
  setCookie(
    req,
    'gel-auth-token',
    '',
    {
      httpOnly: true,
      path: '/',
      secure: appUrl?.startsWith('https://') || false,
      sameSite: true,
      expires: new Date(0),
    },
  )
})
