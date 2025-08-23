import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { getEdgeDbConfiguration } from '../../../utils'

export default defineNitroPlugin(async () => {
  // Get the Nuxt runtime config
  const config = useRuntimeConfig()
  
  // Only run Gel configuration if we haven't already done it
  if (!config.edgeDb.dsn.host) {
    try {
      // Get the app URL from the current request context
      const appUrl = process.env.APP_URL || process.env.NUXT_GEL_APP_URL || 'http://localhost:3000'
      
      // Get Gel configuration at runtime
      const gelConfig = await getEdgeDbConfiguration(
        appUrl,
        {
          auth: config.edgeDb.auth.enabled,
          oauth: config.edgeDb.auth.oauth,
          identityModel: config.edgeDb.auth.identityModel,
          injectDbCredentials: true
        },
        process.cwd(), // Use current working directory (should be the app's root)
        true
      )
      
      // Update the runtime config with Gel credentials
      config.edgeDb.dsn = gelConfig.dsn
      config.edgeDb.urls = { ...config.edgeDb.urls, ...gelConfig.urls }
      
      console.log('✅ [EdgeDB Config] Gel configuration loaded at runtime')
    } catch (error) {
      console.warn('⚠️ [EdgeDB Config] Failed to load Gel configuration at runtime:', error)
      // Don't fail the app startup, just log the warning
    }
  }
})
