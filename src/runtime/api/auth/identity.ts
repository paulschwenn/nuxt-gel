import { defineEventHandler, deleteCookie, getCookie, setCookie } from 'h3'
import { useGelEnv } from '../../server/composables/useGelEnv'
import { useGel } from '../../server/composables/useGel'
import { resolveAuthEnv } from '../../server/utils/resolveAuthEnv'

export default defineEventHandler(async (event) => {
  const { auth } = useGelEnv()
  const { appUrl } = resolveAuthEnv()

  const token = getCookie(event, 'gel-auth-token')

  if (!token) {
    deleteCookie(event, 'gel-auth-token')
    return
  }

  const client = useGel(event)

  try {
    let identityTarget = await client.querySingle(`select global current_user;`)

    if (!identityTarget && token) {
      identityTarget = await client.query(`
      insert ${auth.identityModel} {
        name := '',
        identity := global ext::auth::ClientTokenIdentity
      }
    `)
    }

    return identityTarget
  }
  catch {
    setCookie(
      event,
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
  }
})
