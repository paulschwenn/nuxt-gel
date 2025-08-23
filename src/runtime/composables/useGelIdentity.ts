import type { ComputedRef, Ref } from 'vue'
import type { H3Event } from 'h3'
import type { User } from '#gel/interfaces'
import { useNuxtApp } from '#imports'

interface UseGelIdentityData {
  identity: Ref<User>
  cookie: Ref<string>
  update: (event?: H3Event) => Promise<void>
  logout: (redirectTo?: string) => Promise<void>
  isLoggedIn: ComputedRef<boolean>
}

export function useGelIdentity(): UseGelIdentityData {
  const {
    $gelIdentity: identity,
    $gelCookie: cookie,
    $gelUpdateIdentity: update,
    $gelLogout: logout,
    $gelIsLoggedIn: isLoggedIn,
  } = useNuxtApp()

  const identityData = {
    isLoggedIn,
    identity,
    cookie,
    update,
    logout,
  } as UseGelIdentityData

  return identityData
}
