import semver from 'semver'
import 'colors'

import { executeCommand, executeScript } from './scriptUtils'

interface AuditResultsType {
  advisories: Record<
    string,
    {
      module_name: string
      patched_versions: string
      recommendation: string
    }
  >
}

const runScript = async () => {
  console.log('Auditing unsafe dependencies…'.cyan)

  console.log('Checking unsafe dependency patches…'.cyan)

  const auditResults: AuditResultsType = JSON.parse(await executeCommand('yarn audit --json')) as AuditResultsType

  const compactAdvisories = Object.values(auditResults.advisories).reduce<Record<string, string>>(
    (acc, { module_name, patched_versions, recommendation }) => {
      const previousSemverVersion = acc[module_name]
      const patchedVersion = patched_versions

      let newSemverVersion: string
      if (patchedVersion.startsWith('>=')) {
        newSemverVersion = patchedVersion.replace('>=', '')
      } else {
        console.log(`Unhandled unsafe dependency: ${module_name} - Recommended action: ${recommendation}`.yellow)
        return acc
      }

      const isNewerPatch = !previousSemverVersion || semver.gt(newSemverVersion, previousSemverVersion)
      return isNewerPatch
        ? {
            ...acc,
            [module_name]: isNewerPatch ? newSemverVersion : previousSemverVersion,
          }
        : acc
    },
    {}
  )

  const sortedPatchedModules = Object.keys(compactAdvisories).sort()

  if (sortedPatchedModules.length === 0) {
    console.log('No resolutions to add!'.green)
    return
  }

  console.log(
    `${'Resolutions to add:\n'.cyan}${
      sortedPatchedModules
        .map((moduleName, index) => {
          const version = compactAdvisories[moduleName]
          const isLast = index === sortedPatchedModules.length - 1

          return `"${moduleName}": "^${version}"${isLast ? '' : ','}`
        })
        .join('\n').green
    }`
  )
}

executeScript(runScript)
