export const getRandomArrayElement = <T>(array: T[]) => {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export const pluralize = (number: number, word: string, customPlural?: string, hasNumber = true) => {
  const isPlural = number !== 1
  return `${hasNumber ? `${number} ` : ''}${isPlural ? (customPlural ?? `${word}s`) : word}`
}
