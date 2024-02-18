/**
 * The entrypoint for the post action.
 */

import * as core from '@actions/core'
import { promises as fs } from 'fs'
import * as io from '@actions/io'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const content = core.getInput('post-run', { required: true })
    const scriptPath: string = ((process.env.RUNNER_TEMP as string) + '/post-run.sh')
    await fs.writeFile(scriptPath, content)
    const bashPath: string = await io.which('bash', true)
    await exec.exec(`"${bashPath}"`, [scriptPath])
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
