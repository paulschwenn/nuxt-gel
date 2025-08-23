import { getCookie } from 'h3'
import type { EventHandlerRequest, H3Event } from 'h3'
import type { Client } from 'gel'

export function useGel(req: H3Event<EventHandlerRequest> | undefined = undefined) {
  // @ts-expect-error - untyped global
  const client = globalThis.__nuxt_gel_client__ as Client

  if (req) {
    return client.withGlobals({
      'ext::auth::client_token': req ? getCookie(req, 'gel-auth-token') : undefined,
    })
  }
 
  return client
}
