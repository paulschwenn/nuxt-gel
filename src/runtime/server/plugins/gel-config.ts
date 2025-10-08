import { defineNitroPlugin } from 'nitropack/runtime'
import { getGelConfiguration } from '../../../utils'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(async () => {
  try {
    // Get the Nuxt runtime config
    const config = useRuntimeConfig()

    // Ensure gel config exists and has required structure
    if (!config || !config.gel) {
      console.warn('⚠️ [Gel Config] Gel runtime config not available yet')
      return
    }

    // Initialize gel config structure if missing
    if (!config.gel.dsn) {
      config.gel.dsn = {}
    }
    if (!config.gel.urls) {
      config.gel.urls = {}
    }

    // Only run Gel configuration if we haven't already done it
    if (!config.gel.dsn?.host) {
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
  }
  catch (error) {
    console.error('❌ [Gel Config] Critical error in Gel configuration plugin:', error)
  }
})
