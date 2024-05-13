export const getFileNameFromPath = (path: string) => {
  const splitFullPath = path.split('/')
  const fullFileName = splitFullPath[splitFullPath.length - 1]
  const splitFileName = fullFileName.split('.')
  return splitFileName[0]
}
