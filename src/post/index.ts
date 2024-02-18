/**
 * The entrypoint for the post action.
 */

const core = require('@actions/core')
const fs = require('node:fs').promises
const io = require('@actions/io');
const exec = require('@actions/exec');

async function run() {
  try {
    const content = core.getInput('post-run', { required: true })
    const scriptPath : string = process.env['RUNNER_TEMP'] + "/post-run.sh"
    await fs.writeFile(scriptPath, content)
    const bashPath : string = await io.which('bash', true)
    await exec.exec(`"${bashPath}"`, [scriptPath]);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
