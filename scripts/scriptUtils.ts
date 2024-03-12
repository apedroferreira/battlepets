import { exec } from 'child_process'

export const executeScript = async (runScript: () => void | Promise<void>): Promise<void> => {
  try {
    await runScript()
  } catch (error) {
    console.error((error as Error).message.red)
    process.exit(1)
  }
}

export const executeCommand = (command: string, silent = true): Promise<string> =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line security/detect-child-process
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message))
      } else if (stderr) {
        reject(new Error(stderr))
      }

      resolve(stdout)
    })

    if (!silent && childProcess.stdout && childProcess.stderr) {
      childProcess.stdout.pipe(process.stdout)
      childProcess.stderr.pipe(process.stderr)
    }
  })

export interface Workspace {
  name: string
  location: string
}

export const parseWorkspacesListResult = (result: string): Workspace[] =>
  result !== ''
    ? result
        .trim()
        .split('\n')
        .map(part => JSON.parse(part) as Workspace)
    : []
