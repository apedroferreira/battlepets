import { BPETS_DECIMALS } from '@/common/constants'

export const formatLargeStatNumber = (value: number) => {
  if (value >= 1000000000) {
    const dividedValue = value / 1000000000
    return `${+parseFloat(dividedValue.toFixed(Number.isInteger(dividedValue) ? 0 : BPETS_DECIMALS))}B`
  }
  if (value >= 1000000) {
    const dividedValue = value / 1000000
    return `${+parseFloat(dividedValue.toFixed(Number.isInteger(dividedValue) ? 0 : BPETS_DECIMALS))}M`
  }
  if (value >= 1000) {
    const dividedValue = value / 1000
    return `${+parseFloat(dividedValue.toFixed(Number.isInteger(dividedValue) ? 0 : BPETS_DECIMALS))}K`
  }
  return (+parseFloat(value.toFixed(BPETS_DECIMALS))).toString()
}

export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
