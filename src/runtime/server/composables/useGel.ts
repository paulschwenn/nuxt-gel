import { getCookie } from 'h3'
import type { EventHandlerRequest, H3Event } from 'h3'
import type { Client } from 'gel'

export function useGel(req: H3Event<EventHandlerRequest> | undefined = undefined) {
  // @ts-expect-error - untyped global
  const client = globalThis.__nuxt_gel_client__ as Client

  if (req) {
    // Only forward a valid, non-empty auth token to Gel.
    // An empty string can cause the auth extension to error, breaking public reads.
    const token = getCookie(req, 'gel-auth-token')
    return client.withGlobals({
      'ext::auth::client_token': token && token.length > 0 ? token : undefined,
    })
  }

  return client
}
