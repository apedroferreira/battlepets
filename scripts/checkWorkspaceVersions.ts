import path from 'path'

import yargs from 'yargs'
import 'colors'

import { pluralize } from '../packages/battlepets-shared/utils/generalUtils'

import { executeCommand, executeScript, parseWorkspacesListResult } from './scriptUtils'

interface PackageJson {
  name: string
  version: string
}

interface VersionedWorkspace {
  name: string
  currentVersion: string
  previousVersion: string
}

const ROOT_WORKSPACE_LOCATION = '.'

const argv = yargs(process.argv.slice(2)).options({
  project: { type: 'string' },
})

const runScript = async (): Promise<void> => {
  const { project } = await argv.parse()

  console.log('Checking workspace versions…'.cyan)

  const previousCurrentBranchCommitHash = (await executeCommand('git rev-parse --short --verify HEAD')).trim()

  const changedWorkspaces = parseWorkspacesListResult(
    await executeCommand(`yarn workspaces list --since=${previousCurrentBranchCommitHash} --json`)
  )

  const changedWorkspaceCount = changedWorkspaces.length

  if (changedWorkspaceCount === 0) {
    console.log('✅ No workspace versions to update!'.green)
    process.exit()
  }

  console.log(`⚠️  There are changes in ${pluralize(changedWorkspaceCount, 'workspace')}:`.yellow)
  changedWorkspaces.forEach(changedWorkspace => {
    console.log(`• ${changedWorkspace.name}`.yellow)
  })

  let unfilteredWorkspacesToUpdate = changedWorkspaces
  if (changedWorkspaces.some(workspace => workspace.location === ROOT_WORKSPACE_LOCATION)) {
    unfilteredWorkspacesToUpdate = parseWorkspacesListResult(await executeCommand('yarn workspaces list --json'))
  }

  const workspacesToUpdate = unfilteredWorkspacesToUpdate.filter(
    workspace => (!project || workspace.name === project) && workspace.location !== ROOT_WORKSPACE_LOCATION
  )

  let outdatedWorkspaces: VersionedWorkspace[] = []
  let updatedWorkspaces: VersionedWorkspace[] = []
  for (const workspaceToUpdate of workspacesToUpdate) {
    const packageConfigRelativePath = `${workspaceToUpdate.location}/package.json`

    const currentVersion = ((await import(path.resolve(process.cwd(), packageConfigRelativePath))) as PackageJson)
      .version

    const previousVersion = (
      JSON.parse(
        await executeCommand(`git show ${previousCurrentBranchCommitHash}:${packageConfigRelativePath}`)
      ) as PackageJson
    ).version

    const versionedWorkspace = {
      name: workspaceToUpdate.name,
      currentVersion,
      previousVersion,
    }

    if (currentVersion === previousVersion) {
      outdatedWorkspaces = [...outdatedWorkspaces, versionedWorkspace]
    } else {
      updatedWorkspaces = [...updatedWorkspaces, versionedWorkspace]
    }
  }

  const outdatedWorkspaceCount = outdatedWorkspaces.length

  if (outdatedWorkspaceCount === 0) {
    console.log(`\n${project ? `${project} has` : 'All workspaces have'} been updated!`.green)
  } else {
    console.log(`\nMust update version in ${pluralize(outdatedWorkspaceCount, 'workspace')}:`.red)
  }

  workspacesToUpdate.forEach(workspaceToUpdate => {
    const outdatedWorkspace = outdatedWorkspaces.find(workspace => workspace.name === workspaceToUpdate.name)
    const updatedWorkspace = updatedWorkspaces.find(workspace => workspace.name === workspaceToUpdate.name)

    if (outdatedWorkspace) {
      const currentVersion = outdatedWorkspace.currentVersion
      console.log(`❌ ${outdatedWorkspace.name} (${currentVersion})`.red)
    } else if (updatedWorkspace) {
      console.log(
        `✅ ${updatedWorkspace.name} (${updatedWorkspace.previousVersion} → ${updatedWorkspace.currentVersion})`.green
      )
    }
  })

  if (outdatedWorkspaceCount > 0) {
    process.exit(1)
  }
}

executeScript(runScript)
