import fs from 'fs/promises'
import path from 'path'

import { stringify as csvStringify } from 'csv-stringify'
import csvToJson from 'csvtojson'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

// eslint-disable-next-line import/order
import { executeScript } from '@/utils/scriptUtils'

const getAirdropSnapshotFilePath = (id?: string) =>
  path.resolve(__dirname, `./scriptsData/output/${Date.now()}_airdrop${id ? `_${id}` : ''}.csv`)

const getAddressReferral = (address: string) => address.slice(-4)

type AirdropEntries = {
  address: string
  twitter: string
  telegram: string
  referral: string
}[]

type TelegramGroupMembers = {
  id: string
  username?: string
}[]

const argv = yargs(process.argv.slice(2)).options({
  fileName: { type: 'string', demandOption: true },
  telegramFileName: { type: 'string', demandOption: true },
  ogsFileName: { type: 'string', demandOption: true },
  id: { type: 'string' },
})

const takeAirdropSnapshot = async () => {
  const { fileName, id, ogsFileName, telegramFileName } = await argv.parse()

  const airdropEntriesFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${fileName}.csv`)
  const telegramGroupMembersFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${telegramFileName}.csv`)
  const ogsFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${ogsFileName}.csv`)

  const airdropEntries = (await csvToJson().fromFile(airdropEntriesFilePath)) as AirdropEntries
  const telegramGroupMembers = (await csvToJson().fromFile(telegramGroupMembersFilePath)) as TelegramGroupMembers
  const ogs = (await csvToJson().fromFile(ogsFilePath)) as { address: string }[]

  const validAirdropEntries = airdropEntries.filter(({ address, referral, telegram, twitter }, index, self) => {
    if (!address) {
      throw new Error('Missing entry address!')
    }
    if (!twitter) {
      throw new Error('Missing entry Twitter username!')
    }
    if (!telegram) {
      throw new Error('Missing entry Telegram username!')
    }

    const addressReferral = getAddressReferral(address)

    return (
      addressReferral.toUpperCase() !== referral.toUpperCase() &&
      telegramGroupMembers.some(({ username }) => username === telegram) &&
      index ===
        self.findIndex(
          airdropEntry =>
            airdropEntry.address === address || airdropEntry.twitter === twitter || airdropEntry.telegram === telegram
        )
    )
  })

  const validAirdropAddresses = validAirdropEntries.map(({ address }) => address)
  const missingOgs = ogs.filter(({ address }) => !validAirdropAddresses.includes(address))
  const validAirdropAddressesWithOgs = [...validAirdropAddresses, ...missingOgs.map(({ address }) => address)]

  const airdropAllocations = validAirdropEntries.map(({ address, referral }, _index, self) => {
    const isOG = ogs.some(({ address: ogsAddress }) => ogsAddress === address)
    const isValidReferral = Boolean(referral) && validAirdropAddressesWithOgs.includes(referral)

    const addressReferral = getAddressReferral(address)

    return {
      address,
      weight: Math.min(
        (isOG ? 15 : isValidReferral ? 11 : 10) +
          self.filter(
            airdropEntry =>
              airdropEntry.referral && airdropEntry.referral.toUpperCase() === addressReferral.toUpperCase()
          ).length *
            2,
        100
      ),
      status: 'pending',
    }
  })

  const airdropAllocationsWithOgs = [
    ...airdropAllocations,
    ...missingOgs.map(({ address }) => ({ address, weight: 12, status: 'pending' })),
  ].sort((a, b) => b.weight - a.weight)

  const airdropCsv = csvStringify(airdropAllocationsWithOgs, {
    columns: ['address', 'weight', 'status'],
    header: true,
  })

  const airdropSnapshotFilePath = getAirdropSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(airdropSnapshotFilePath, airdropCsv)

  console.log(`Airdrop snapshot taken and saved at ${path.relative(__dirname, airdropSnapshotFilePath)}!`.green)
}

executeScript(takeAirdropSnapshot)
