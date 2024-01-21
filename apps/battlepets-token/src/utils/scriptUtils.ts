import getCallerFile from 'get-caller-file'
import 'colors'

import { getFileNameFromPath } from './generalUtils'

export const terminateScript = async (
  omitTerminationMessage = false,
  hasError = false,
  scriptName = getFileNameFromPath(getCallerFile())
): Promise<void> => {
  if (!omitTerminationMessage) {
    const scriptNameInMessage = scriptName ? `"${scriptName}"` : ''
    if (hasError) {
      console.log(`Script ${scriptNameInMessage} terminated with error.`.red)
      process.exit(1)
    } else {
      console.log(`Script ${scriptNameInMessage} successful and terminated!`.green)
    }
  }
}

export const executeScript = async (
  runScript: () => void | Promise<void>,
  scriptName = getFileNameFromPath(getCallerFile())
): Promise<void> => {
  let hasError = false
  try {
    await runScript()
  } catch (error) {
    console.error(((error as Error).message || (error as Error).name).red)
    hasError = true
  } finally {
    await terminateScript(false, hasError, scriptName)
  }
}
