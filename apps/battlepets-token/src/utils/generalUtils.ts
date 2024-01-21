import { last } from 'ramda'

export const getFileNameFromPath = (path: string): string => {
  const splitFullPath = path.split('/')
  const splitFilePath = (last(splitFullPath) ?? '').split('.')
  return splitFilePath[0]
}
