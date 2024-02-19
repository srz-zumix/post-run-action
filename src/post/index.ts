/**
 * The entrypoint for the post action.
 */

import * as core from '@actions/core'
import { promises as fs } from 'fs'
import * as io from '@actions/io'
import * as exec from '@actions/exec'

async function resolveShell(): Promise<string[]> {
  const defaultCommands: {[key: string]: string[]}  = {
    'default': [ 'bash', '-e', '{0}' ],
    'bash': [ 'bash', '--noprofile', '--norc', '-eo', 'pipefail', '{0}' ]
  }
  const shellCommand: string = core.getInput('shell', { required: false })
  let shellCommands = shellCommand.split(' ')
  if( shellCommands.length == 0 ) {
    shellCommands = defaultCommands['default']
  }
  if( shellCommands.length == 1 ) {
    shellCommands = defaultCommands[shellCommands[0]]
  }
  return shellCommands
}

async function run(): Promise<void> {
  try {
    const content: string = core.getInput('post-run', { required: true })
    const shellCommands: string[] = await resolveShell()
    const commandPath: string = await io.which(shellCommands[0], true)
      
    const runnerTempPath: string = process.env.RUNNER_TEMP as string
    const scriptPath = `${runnerTempPath}/post-run.sh`

    const commandArgs = shellCommands.slice(1).map((item) => item === '{0}' ? scriptPath : item)

    await fs.writeFile(scriptPath, content)
    await exec.exec(commandPath, [scriptPath])
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

void run()
