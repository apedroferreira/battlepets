import { execSync } from 'child_process'

import dotenv from 'dotenv'

const HAS_INITIALIZED_ENV_KEY = 'HAS_INITIALIZED_ENV'

const REMOTE_SCRIPT_ENV = process.env.REMOTE_SCRIPT_ENV

const executeCommandSync = (command: string): string => execSync(command).toString('utf8')

const loadRemoteScriptEnv = (): void => {
  try {
    if (REMOTE_SCRIPT_ENV) {
      const allSecrets = JSON.parse(executeCommandSync(`vlt secrets list -a ${REMOTE_SCRIPT_ENV} -f json`)) as {
        name: string
      }[]
      const allSecretKeys = allSecrets.map(secret => secret.name)

      for (const secretKey of allSecretKeys) {
        const secretValue = executeCommandSync(
          `vlt secrets get -a ${REMOTE_SCRIPT_ENV} --plaintext ${secretKey}`
        ).trim()
        process.env[secretKey] = secretValue
      }
    }
  } catch (error) {
    console.error((error as Error).message.red)
    process.exit(1)
  }
}

export const initializeEnv = (): void => {
  if (process.env[HAS_INITIALIZED_ENV_KEY] !== 'true') {
    dotenv.config()
    loadRemoteScriptEnv()
    process.env[HAS_INITIALIZED_ENV_KEY] = 'true'
  }
}
