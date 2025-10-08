import type { EventHandlerRequest, H3Event } from 'h3'
import { useGel } from './useGel'
// Types from generated queries may not be present during typecheck in dev.
// We intentionally keep this loosely typed for DX in the module/playground.
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore virtual alias may be absent until codegen runs
import * as queries from '#gel/queries'

export type GelQueries = keyof typeof queries

export function useGelQueries(
  req: H3Event<EventHandlerRequest> | undefined = undefined,
): Record<string, any> {
  const client = useGel(req)

  const entries = Object.entries(queries as any).map(([key, fn]) => {
    return [key, (args?: any) => (fn as any)(client, args)]
  })

  return Object.fromEntries(entries) as any
}
