import { defineEventHandler } from 'h3'
import { useGel } from '../../server/composables/useGel'

export default defineEventHandler(async () => {
  const client = useGel()

  const result = await client.query(`
    select cfg::Config.extensions[is ext::auth::AuthConfig].providers {
      name,
      [is ext::auth::OAuthProviderConfig].display_name,
    };
  `)

  return result
})
