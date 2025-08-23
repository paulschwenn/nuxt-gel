import e from '#gel/builder'

export type GelQueryBuilder = typeof e

export function useGelQueryBuilder(): GelQueryBuilder {
  return e
}
