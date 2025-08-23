import { useRuntimeConfig } from '#imports'

export function useGelEnv() {
  const { gel } = useRuntimeConfig()

  return gel
}
