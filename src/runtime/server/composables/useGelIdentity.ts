import type { EventHandlerRequest, H3Event } from 'h3'
import { getCookie, sendRedirect, setCookie } from 'h3'
import { useGel } from './useGel'

interface UseGelIdentityData<T = any> {
  identity: T
  cookie: string
  update: (event?: H3Event) => Promise<void>
  logout: (redirectTo?: string) => Promise<void>
  isLoggedIn: boolean
}

export async function useGelIdentity<T>(
  req: H3Event<EventHandlerRequest> | undefined = undefined,
): Promise<UseGelIdentityData<T>> {
  const client = useGel(req)

  let token: string | undefined

  let user: T | undefined

  const update = async () => {
    if (req)
      token = getCookie(req, 'gel-auth-token')

    user = client.querySingle(`select global current_user;`) as T
  }

  const logout = async (redirectTo: string | undefined) => {
    if (!req)
      return

    setCookie(req, 'gel-auth-token', '')

    if (redirectTo)
      return sendRedirect(req, '/')
  }

  await update()

  const identityData = {
    isLoggedIn: !!user,
    identity: user,
    cookie: token,
    update,
    logout,
  } as UseGelIdentityData

  return identityData
}
