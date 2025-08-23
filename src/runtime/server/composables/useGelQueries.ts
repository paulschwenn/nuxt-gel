import type { EventHandlerRequest, H3Event } from 'h3'
import { useGel } from './useGel'
import * as queries from '#gel/queries'

export type GelQueries = keyof typeof queries

export function useGelQueries(
  req: H3Event<EventHandlerRequest> | undefined = undefined,
): { [K in GelQueries]: (arg?: Parameters<typeof queries[K]>[1]) => ReturnType<typeof queries[K]> } {
  const client = useGel(req)

  return Object.fromEntries(
    Object.entries(queries).map(([key, fn]) => {
      return [
        key,
        (args?: Parameters<typeof fn>[1]) => fn(client, args),
      ]
    }),
  )
}
