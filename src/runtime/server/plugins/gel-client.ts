import { createClient } from 'gel'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { useGelEnv } from '../composables/useGelEnv'

export default defineNitroPlugin(() => {
  const { dsn } = useGelEnv()

  const client = createClient({
    dsn: dsn.full,
    tlsSecurity: dsn.tlsSecurity,
    tlsCA: dsn.tlsCA,
  }) 

  globalThis.__nuxt_gel_client__ = client
})
