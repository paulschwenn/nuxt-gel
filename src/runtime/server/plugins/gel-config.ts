import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { getGelConfiguration } from '../../../utils'

export default defineNitroPlugin(async () => {
  // Get the Nuxt runtime config
  const config = useRuntimeConfig()

  // Only run Gel configuration if we haven't already done it
  if (!config.gel.dsn.host) {
    try {
      // Get the app URL from the current request context
      const appUrl = process.env.APP_URL || process.env.NUXT_GEL_APP_URL || 'http://localhost:3000'

      // Get Gel configuration at runtime
      const gelConfig = await getGelConfiguration(
        appUrl,
        {
          auth: config.gel.auth.enabled,
          oauth: config.gel.auth.oauth,
          identityModel: config.gel.auth.identityModel,
          injectDbCredentials: true,
        },
        process.cwd(), // Use current working directory (should be the app's root)
        true,
      )

      // Update the runtime config with Gel credentials
      config.gel.dsn = gelConfig.dsn
      config.gel.urls = { ...config.gel.urls, ...gelConfig.urls }

      console.log('✅ [Gel Config] Gel configuration loaded at runtime')
    }
    catch (error) {
      console.warn('⚠️ [Gel Config] Failed to load Gel configuration at runtime:', error)
      // Don't fail the app startup, just log the warning
    }
  }
})
