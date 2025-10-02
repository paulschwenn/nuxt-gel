import { existsSync } from 'node:fs'
import * as p from '@clack/prompts'
import * as execa from 'execa'
import { createResolver } from '@nuxt/kit'
import chalk from 'chalk'

const { resolve: resolveProject } = createResolver(process.cwd())
const GENERATOR_PACKAGE = '@gel/generate'

interface PackageManagerRunner {
  command: string
  args: string[]
  agentPrefix?: string
}

function resolveLocalGeneratorBinary() {
  const unixPath = resolveProject('node_modules/.bin/generate')
  if (existsSync(unixPath))
    return unixPath

  const windowsPath = resolveProject('node_modules/.bin/generate.cmd')
  if (existsSync(windowsPath))
    return windowsPath
}

function createRunnerList(agent?: string | null): PackageManagerRunner[] {
  const baseRunners: PackageManagerRunner[] = [
    { command: 'pnpm', args: ['dlx'], agentPrefix: 'pnpm/' },
    { command: 'yarn', args: ['dlx'], agentPrefix: 'yarn/' },
    { command: 'bunx', args: [], agentPrefix: 'bun/' },
    { command: 'npx', args: ['--yes'], agentPrefix: 'npm/' },
  ]

  if (!agent)
    return baseRunners

  const prioritized = baseRunners.filter(runner => runner.agentPrefix && agent.startsWith(runner.agentPrefix))
  const remaining = baseRunners.filter(runner => !prioritized.includes(runner))

  return [...prioritized, ...remaining]
}

function shouldFallbackToNextRunner(error: any) {
  if (!error)
    return false

  if (error.code === 'ENOENT')
    return true

  if (typeof error.exitCode === 'number' && error.exitCode === 127)
    return true

  const message = typeof error.message === 'string' ? error.message : ''
  const stderr = error?.stderr ? String(error.stderr) : ''

  return /not found|not recognized/i.test(message) || /not found|not recognized/i.test(stderr)
}

async function runGelGenerate(subCommand: string, generatorArgs: string[]) {
  const cwd = resolveProject()
  const localBinary = resolveLocalGeneratorBinary()

  if (localBinary) {
    await execa.execa(localBinary, [subCommand, ...generatorArgs], { cwd, preferLocal: true })
    return
  }

  const agent = process.env.npm_config_user_agent ?? null
  const runners = createRunnerList(agent)
  let lastError: any

  for (const runner of runners) {
    try {
      await execa.execa(runner.command, [...runner.args, GENERATOR_PACKAGE, subCommand, ...generatorArgs], { cwd })
      return
    }
    catch (error) {
      if (shouldFallbackToNextRunner(error))
        continue

      lastError = error
      break
    }
  }

  if (lastError)
    throw lastError

  throw new Error('Unable to locate a package manager capable of running @gel/generate.')
}

async function runGeneratorStep(startMessage: string, successMessage: string, failureMessage: string, subCommand: string, args: string[]) {
  const spinner = p.spinner()
  spinner.start(startMessage)

  try {
    await runGelGenerate(subCommand, args)
    spinner.stop(successMessage)
  }
  catch (error: any) {
    spinner.stop(failureMessage)

    const stderrOutput = error?.stderr ? String(error.stderr) : ''

    if (stderrOutput)
      p.log.error(stderrOutput)
    else if (error?.message)
      p.log.error(error.message)
    else
      p.log.error('Unknown error while running @gel/generate.')

    process.exit(1)
  }
}

async function up() {
  p.intro(chalk.bgGreen.blue(` nuxt-gel `))

  /**
   * CLI Install detection
   */
  let gelCliVersion: string | undefined
  try {
    gelCliVersion = await execa.execa(`gel`, [`--version`], { cwd: resolveProject() }).then(result => result.stdout.replace('Gel CLI ', ''))
  }
  catch {
  }

  if (!gelCliVersion) {
    const setupGelCli = await p.select({
      message: 'Gel CLI not found, do you want to install Gel it?',
      options: [
        { label: 'Yes', value: 'yes', hint: 'recommended' },
        { label: 'No', value: 'no', hint: 'skip installation' },
      ],
    })

    if (setupGelCli === 'yes') {
      const spinner = p.spinner()

      try {
        spinner.start('Installing Gel CLI...')
        await execa.$`curl https://www.geldata.com/sh --proto "=https" -sSf1 | sh`
        gelCliVersion = await execa.execa(`gel`, ['--version'], { cwd: resolveProject() }).then(result => result.stdout.replace('Gel CLI ', ''))
        spinner.stop(`Gel CLI version ${gelCliVersion} installed.`)
      }
      catch {
        spinner.stop('Failed to install Gel CLI.')
        p.log.warn(`Try running: \`${chalk.green('curl https://www.geldata.com/sh --proto "=https" -sSf1 | sh')}\` manually.`)
      }
    }

    if (!gelCliVersion) {
      process.exit(0)
    }
  }
  else {
    p.log.success(`Gel CLI version ${chalk.blue(gelCliVersion)} found.`)
  }

  const groupData = await p.group(
    {
      path: () => p.text({ message: 'Where to setup dbschema?', defaultValue: './dbschema', placeholder: './dbschema' }),
      interfaces: () => p.text({ message: 'Generate interfaces?', defaultValue: 'yes', placeholder: 'yes' }),
      queries: () => p.text({ message: 'Generate queries?', defaultValue: 'yes', placeholder: 'yes' }),
      queryBuilder: () => p.text({ message: 'Generate query builder?', defaultValue: 'yes', placeholder: 'yes' }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.')
        process.exit(0)
      },
    },
  )

  const dbschemaPath = resolveProject(groupData.path)

  if (!existsSync(dbschemaPath)) {
    p.log.error(`Your ${chalk.green('dbschema')} directory does not exist, you must run \`${chalk.green('gel project init')}\` at least once before running this command.`)
  }

  if (groupData.interfaces === 'yes') {
    await runGeneratorStep(
      'Generating interfaces...',
      'Interfaces generated.',
      'Failed to generate interfaces.',
      'interfaces',
      ['--file', `${dbschemaPath}/interfaces.ts`, '--force-overwrite'],
    )
  }

  if (groupData.queries === 'yes') {
    await runGeneratorStep(
      'Generating queries...',
      'Queries generated.',
      'Failed to generate queries.',
      'queries',
      ['--file', `${dbschemaPath}/queries`, '--target=ts', '--force-overwrite'],
    )
  }

  if (groupData.queryBuilder === 'yes') {
    await runGeneratorStep(
      'Generating query builder...',
      'Query builder generated.',
      'Failed to generate query builder.',
      'edgeql-js',
      ['--output-dir', `${dbschemaPath}/query-builder`, '--force-overwrite', '--target=ts'],
    )
  }

  p.log.success('Done. Feel free to checkout the next steps on the README')

  p.log.success('https://github.com/veritymedia/nuxt-gel#readme')
}

up()
