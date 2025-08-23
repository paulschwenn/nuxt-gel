import { existsSync } from 'node:fs'
import type { NuxtModule } from 'nuxt/schema'
import { addComponentsDir, addImports, addPlugin, addServerHandler, addServerImports, addServerPlugin, createResolver, defineNuxtModule, logger } from '@nuxt/kit'
import { join } from 'pathe'
import * as execa from 'execa'
import chalk from 'chalk'
import { getGelConfiguration } from './utils'

// Module options TypeScript interface definition
export interface ModuleOptions {
  devtools: boolean
  watch: boolean
  watchPrompt: true
  dbschemaDir: string
  queriesDir: string
  composables: boolean
  auth: boolean
  oauth: boolean
  injectDbCredentials: boolean
  projectInit: boolean
  installCli: boolean
  identityModel: string
}

const { resolve: resolveLocal } = createResolver(import.meta.url)

const nuxtModule = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-gel-module',
    configKey: 'gel',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    devtools: true,
    watch: true,
    watchPrompt: true,
    dbschemaDir: 'dbschema',
    queriesDir: 'queries',
    projectInit: true,
    installCli: true,
    composables: true,
    injectDbCredentials: true,
    auth: false,
    oauth: false,
    identityModel: 'User',
  },
  async setup(options, nuxt) {
    // console.log('🔍 [MODULE SETUP] Debug Info:')
    // console.log('  - nuxt.options.rootDir:', nuxt.options.rootDir)
    // console.log('  - process.cwd():', process.cwd())
    // console.log('  - options.dbschemaDir:', options.dbschemaDir)
    // console.log('  - options:', JSON.stringify(options, null, 2))

    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir)
    const dbschemaDir = resolveProject(options.dbschemaDir)

    // console.log('  - resolveProject result:', resolveProject())
    // console.log('  - dbschemaDir resolved:', dbschemaDir)

    const canPrompt = nuxt.options.dev

    // Transpile gel
    nuxt.options.build.transpile ??= []
    nuxt.options.build.transpile.push('gel')
    nuxt.options.build.transpile.push('nuxt-gel-module')

    const envAppUrl = process.env.APP_URL || process.env.NUXT_GEL_APP_URL

    // Create dev app url
    const devAppUrl = [
      nuxt.options.devServer.https ? `https://` : `http://`,
      nuxt.options.devServer.host ? nuxt.options.devServer.host : 'localhost',
      nuxt.options.devServer.port ? `:${nuxt.options.devServer.port}` : '',
    ].join('')

    const appUrl = envAppUrl || devAppUrl

    // console.log('  - appUrl:', appUrl)
    // console.log('  - About to set basic runtime config (no Gel operations)')

    // Set basic runtime configuration first
    nuxt.options.runtimeConfig.gel = {
      auth: {
        enabled: options?.auth || false,
        oauth: options?.oauth || false,
        identityModel: options?.identityModel || 'User',
      },
      dsn: {},
      urls: { appUrl },
    }

    // Try to get Gel configuration if injectDbCredentials is enabled
    if (options.injectDbCredentials) {
      try {
        const gelConfig = await getGelConfiguration(appUrl, options, nuxt.options.rootDir, options.injectDbCredentials)
        if (gelConfig) {
          const currentGel = nuxt.options.runtimeConfig.gel as any
          nuxt.options.runtimeConfig.gel = {
            ...currentGel,
            auth: { ...currentGel.auth, ...gelConfig.auth },
            dsn: { ...currentGel.dsn, ...gelConfig.dsn },
            urls: { ...currentGel.urls, ...gelConfig.urls },
          }
        }
      }
      catch (error) {
        console.warn('⚠️ [Gel Module] Failed to get Gel configuration at build time:', error)
        // Continue with basic config, plugin will handle runtime configuration
      }
    }

    // Set basic runtime configuration at build time (no Gel operations)
    // nuxt.options.runtimeConfig.gel ??= {
    //   auth: {
    //     enabled: options?.auth || false,
    //     oauth: options?.oauth || false,
    //     identityModel: options?.identityModel || 'User'
    //   },
    //   dsn: {},
    //   urls: { appUrl }
    // }

    // Defer Gel configuration to runtime via a plugin
    if (options.injectDbCredentials) {
      addServerPlugin(resolveLocal('./runtime/server/plugins/gel-config'))
    }

    /**
     * Devtools
     */

    if (canPrompt && options.devtools) {
      let uiUrl: any | undefined
      if (!process.env.NUXT_GEL_UI_URL && options.injectDbCredentials) {
        try {
          uiUrl = await execa.execa(`gel`, ['ui', '--print-url'], { cwd: resolveProject() })
        }
        catch {

        }
      }

      if (process.env?.NUXT_GEL_UI_URL || uiUrl?.stdout) {
        nuxt.hook('devtools:customTabs' as any, (tabs: any[]) => {
          tabs.push({
            // unique identifier
            name: 'nuxt-gel-module',
            // title to display in the tab
            title: 'Gel',
            // any icon from Iconify, or a URL to an image
            icon: 'logos:database',
            category: 'app',
            // iframe view
            view: {
              type: 'iframe',
              src: process.env?.NUXT_GEL_UI_URL || uiUrl.stdout,
              persistent: true,
            },
          })
        })
      }
    }

    if (!existsSync(dbschemaDir)) {
      logger.withTag('gel').error(`Could not find dbschema directory.\n\nYou must run "${chalk.green.bold('gel project init')}" in your project root.`)
      process.exit(1)
    }

    const queriesPath = join(dbschemaDir, '/queries.ts')
    const interfacesPath = join(dbschemaDir, '/interfaces.ts')
    const builderPath = join(dbschemaDir, '/query-builder/index.ts')

    const hasQueries = existsSync(queriesPath)
    const hasInterfaces = existsSync(interfacesPath)
    const hasQueryBuilder = existsSync(builderPath)

    // Inject aliases
    const nuxtOptions = nuxt.options
    nuxtOptions.alias = nuxtOptions.alias ?? {}

    if (hasQueries)
      nuxtOptions.alias['#gel/queries'] = queriesPath
    if (hasInterfaces)
      nuxtOptions.alias['#gel/interfaces'] = interfacesPath
    if (hasQueryBuilder)
      nuxtOptions.alias['#gel/builder'] = builderPath

    if (options.composables) {
      // Add server plugin for Gel client
      addServerPlugin(resolveLocal('./runtime/server/plugins/gel-client'))

      // Add server imports manually
      addServerImports([
        {
          from: resolveLocal('./runtime/server/composables/useGel'),
          name: 'useGel',
        },
        {
          from: resolveLocal('./runtime/server/composables/useGelEnv'),
          name: 'useGelEnv',
        },
        {
          from: resolveLocal('./runtime/server/composables/useGelPKCE'),
          name: 'useGelPKCE',
        },
      ])

      if (hasQueryBuilder) {
        addServerImports([
          {
            from: resolveLocal('./runtime/server/composables/useGelQueryBuilder'),
            name: 'useGelQueryBuilder',
          },
        ])
      }

      if (hasQueries) {
        addServerImports([
          {
            from: resolveLocal('./runtime/server/composables/useGelQueries'),
            name: 'useGelQueries',
          },
        ])
      }

      // Add server-side auto-imports
      nuxt.hook(
        'nitro:config',
        (config) => {
          // Push externals
          config.externals ??= {}
          config.externals.inline ??= []
          config.externals.inline.push(resolveLocal('./runtime/server'))

          // Fixes for weird cjs query builder imports
          if (hasQueryBuilder) {
            config.replace ??= {}
            config.replace['gel/dist/primitives/buffer'] = 'gel/dist/primitives/buffer.js'
            config.replace['gel/dist/reflection/index'] = 'gel/dist/reflection/index.js'
          }

          // Push server aliases
          config.alias ??= {}

          if (hasQueries)
            config.alias['#gel/queries'] = join(dbschemaDir, '/queries.ts')
          if (hasInterfaces)
            config.alias['#gel/interfaces'] = join(dbschemaDir, '/interfaces.ts')
          if (hasQueryBuilder)
            config.alias['#gel/builder'] = join(dbschemaDir, '/query-builder/index.ts')

          // Enforce paths on typescript config
          config.typescript ??= {}
          config.typescript.tsConfig ??= {}
          config.typescript.tsConfig.compilerOptions ??= {}
          config.typescript.tsConfig.compilerOptions.paths ??= {}

          if (hasQueries)
            config.typescript.tsConfig.compilerOptions.paths['#gel/queries'] = [`${join(dbschemaDir, '/queries.ts')}`]
          if (hasInterfaces)
            config.typescript.tsConfig.compilerOptions.paths['#gel/interfaces'] = [`${join(dbschemaDir, '/interfaces.ts')}`]
          if (hasQueryBuilder)
            config.typescript.tsConfig.compilerOptions.paths['#gel/builder'] = [`${join(dbschemaDir, '/query-builder/index.ts')}`]
        },
      )
    }

    if (options.auth) {
      // Runtime
      addPlugin({
        src: resolveLocal('./runtime/plugins/gel-auth'),
        mode: 'all',
      })
      addComponentsDir({
        path: resolveLocal('./runtime/components/auth/base'),
        global: true,
      })
      addImports([
        {
          from: resolveLocal('./runtime/composables/useGelIdentity'),
          name: 'useGelIdentity',
        },
      ])

      // Server
      addServerImports([
        {
          from: resolveLocal('./runtime/server/composables/useGelIdentity'),
          name: 'useGelIdentity',
        },
      ])
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/login'),
        route: '/api/auth/login',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/logout'),
        route: '/api/auth/logout',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/verify'),
        route: '/api/auth/verify',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/callback'),
        route: '/api/auth/callback',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/reset-password-ui'),
        route: '/api/auth/reset-password-ui',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/reset-password'),
        route: '/api/auth/reset-password',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/send-password-reset-email'),
        route: '/api/auth/send-password-reset-email',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/signup'),
        route: '/api/auth/signup',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/identity'),
        route: '/api/auth/identity',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/providers'),
        route: '/api/auth/providers',
      })
    }

    if (options.oauth) {
      addComponentsDir({
        path: resolveLocal('./runtime/components/auth/oauth'),
        global: true,
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/authorize'),
        route: '/api/auth/authorize',
      })
      addServerHandler({
        handler: resolveLocal('./runtime/api/auth/callback'),
        route: '/api/auth/callback',
      })
    }
  },
})

export default nuxtModule

declare module 'nuxt/schema' {
  interface NuxtConfig {
    ['gel']?: typeof nuxtModule extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
  }

  interface RuntimeConfig {
    gel: {
      auth: {
        enabled: boolean
        oauth: boolean
        identityModel: string
      }
      identityModel?: string
      urls: {
        appUrl?: string
        authBaseUrl?: string
        resetPasswordUrl?: string
        verifyRedirectUrl?: string
        oAuthCallbackUrl?: string
        oAuthRedirectUrl?: string
      }
      dsn: {
        host?: string
        port?: string
        user?: string
        pass?: string
        database?: string
        tlsCA?: string
        tlsSecurity?: 'insecure' | 'no_host_verification' | 'strict' | 'default' | undefined
      }
    }
  }

  interface PublicRuntimeConfig {

  }
}
