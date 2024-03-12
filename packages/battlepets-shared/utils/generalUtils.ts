export const pluralize = (number: number, word: string, customPlural?: string, hasNumber = true): string => {
  const isPlural = number !== 1
  return `${hasNumber ? `${number} ` : ''}${isPlural ? customPlural ?? `${word}s` : word}`
}
