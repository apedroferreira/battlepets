import path from 'path'

import csvToJson from 'csvtojson'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

// eslint-disable-next-line import/order
import { executeScript } from '@/utils/scriptUtils'

type AddressesEntries = {
  address: string
  weight?: number
}[]

const argv = yargs(process.argv.slice(2)).options({
  fileName: { type: 'string', demandOption: true },
  count: { type: 'number', demandOption: true },
  ignoreWeights: { type: 'boolean' },
})

const getLuckyAddresses = async () => {
  const { count, fileName, ignoreWeights = false } = await argv.parse()

  const addressesFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${fileName}.csv`)

  const addressesEntries = (await csvToJson().fromFile(addressesFilePath)) as AddressesEntries

  const validAddressEntries = addressesEntries.filter(({ address }, index, self) => {
    if (!address) {
      throw new Error('Missing entry address!')
    }

    return index === self.findIndex(airdropEntry => airdropEntry.address === address)
  })

  if (count > validAddressEntries.length) {
    throw new Error('"count" option must not be greater than the number of valid entries!')
  }

  let luckyAddresses: string[] = []
  let remainingAddressesEntries = validAddressEntries

  for (let luckyAddressIndex = 0; luckyAddressIndex < count; luckyAddressIndex += 1) {
    const cumulativeWeights: number[] = []
    for (let addressEntryIndex = 0; addressEntryIndex < remainingAddressesEntries.length; addressEntryIndex += 1) {
      cumulativeWeights[addressEntryIndex] =
        (ignoreWeights ? 1 : Number(remainingAddressesEntries[addressEntryIndex].weight ?? 1)) +
        (cumulativeWeights[addressEntryIndex - 1] ?? 0)
    }

    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1]
    const luckyWeightedNumber = maxCumulativeWeight * Math.random()

    const luckyAddressEntryIndex = cumulativeWeights.findIndex(weight => weight >= luckyWeightedNumber)

    const luckyAddress = remainingAddressesEntries[luckyAddressEntryIndex].address

    luckyAddresses = [...luckyAddresses, luckyAddress]
    remainingAddressesEntries = remainingAddressesEntries.filter(addressEntry => addressEntry.address !== luckyAddress)
  }

  console.log(`Lucky addresses:\n${luckyAddresses.join('\n')}\n`.green)
}

executeScript(getLuckyAddresses)
