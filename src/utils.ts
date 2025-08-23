import { execa } from 'execa'
import type { ModuleOptions } from './module'

export async function getGelCredentials(
  cwd: string,
  processInject: boolean = true,
) {
      console.log('🔍 [getGelCredentials] Debug Info:')
  console.log('  - cwd parameter:', cwd)
  console.log('  - process.cwd():', process.cwd())
  console.log('  - processInject:', processInject)
  
  let dbCredentials: any | undefined

  try {
    console.log('  - About to run: gel instance credentials --json in cwd:', cwd)
    dbCredentials = await execa('gel', ['instance', 'credentials', '--json'], { cwd })
    console.log('  - Command succeeded, stdout:', dbCredentials.stdout)
  }
  catch (e: any) {
    console.log("❌ [getGelCredentials] Error getting Gel instance credentials:", e)
    console.log("  - Error details:", {
      command: e.command,
      cwd: e.cwd,
      exitCode: e.exitCode,
      stderr: e.stderr
    })
  }

  if (dbCredentials) {
    const { host, port, database, user, password, tls_ca, tls_security, branch } = JSON.parse(dbCredentials.stdout)

    if (processInject) {
      if (!process.env.NUXT_GEL_HOST)
        process.env.NUXT_GEL_HOST = host
      if (!process.env.NUXT_GEL_PORT)
        process.env.NUXT_GEL_PORT = port
      if (!process.env.NUXT_GEL_DATABASE)
        process.env.NUXT_GEL_DATABASE = database
      if (!process.env.NUXT_GEL_BRANCH)
        process.env.NUXT_GEL_BRANCH = branch || database // use branch if available, fallback to database
      if (!process.env.NUXT_GEL_USER)
        process.env.NUXT_GEL_USER = user
      if (!process.env.NUXT_GEL_PASS)
        process.env.NUXT_GEL_PASS = password
      if (!process.env.NUXT_GEL_TLS_CA)
        process.env.NUXT_GEL_TLS_CA = tls_ca
      if (!process.env.NUXT_GEL_TLS_SECURITY)
        process.env.NUXT_GEL_TLS_SECURITY = tls_security
      if (!process.env.NUXT_GEL_AUTH_BASE_URL)
        process.env.NUXT_GEL_AUTH_BASE_URL = `http://${host}:${port}/branch/${branch || database}/ext/auth/`
    }

    return { host, port, database, user, password, tls_ca, tls_security }
  }
}

export async function getGelConfiguration(
  appUrl: string,
  options: Partial<ModuleOptions> = {},
  cwd: string = process.cwd(),
  processInject: boolean = true,
) {
      console.log('🔍 [getGelConfiguration] Debug Info:')
  console.log('  - appUrl:', appUrl)
  console.log('  - cwd parameter:', cwd)
  console.log('  - processInject:', processInject)
  console.log('  - options:', JSON.stringify(options, null, 2))
  
      await getGelCredentials(cwd, processInject)

  const {
    // Gel DSN settings
    NUXT_GEL_HOST: host,
    NUXT_GEL_PORT: port,
    NUXT_GEL_USER: user,
    NUXT_GEL_PASS: pass,
    NUXT_GEL_DATABASE: database,
    NUXT_GEL_BRANCH: branch,
    NUXT_GEL_TLS_CA: tlsCA,
    NUXT_GEL_TLS_SECURITY: tlsSecurity,

    // Gel Auth settings
    NUXT_GEL_IDENTITY_MODEL: identityModel = options?.identityModel || 'User',
 
    // Gel Auth URls
    NUXT_GEL_AUTH_BASE_URL: authBaseUrl = `http://${host}:${port}/branch/${branch || database}/ext/auth/`,
    NUXT_GEL_OAUTH_CALLBACK: oAuthCallbackUrl = `http://${host}:${port}/branch/${branch || database}/ext/auth/callback`,

    // Gel Nuxt Auth URLs
    NUXT_GEL_AUTH_VERIFY_REDIRECT_URL: verifyRedirectUrl = `${appUrl}/auth/verify`,
    NUXT_GEL_AUTH_RESET_PASSWORD_URL: resetPasswordUrl = `${appUrl}/auth/reset-password`,
    NUXT_GEL_OAUTH_REDIRECT_URL: oAuthRedirectUrl = `${appUrl}/auth/callback`,
  } = process.env

  const dsn = {
    host,
    port,
    user,
    pass,
    database,
    tlsCA,
    tlsSecurity: tlsSecurity as 'insecure' | 'no_host_verification' | 'strict' | 'default' | undefined,
    full: `gel://${user}:${pass}@${host}:${port}/${database}`,
  }

  const urls = {
    // Gel Nuxt Auth URLs
    appUrl,
    resetPasswordUrl,
    verifyRedirectUrl,
    oAuthRedirectUrl,

    // Gel Auth URls
    authBaseUrl,
    oAuthCallbackUrl,
  }

  const auth = {
    enabled: options?.auth || false,
    oauth: options?.oauth || false,
    identityModel,
  }

  return {
    auth,
    dsn,
    urls,
  }
}
