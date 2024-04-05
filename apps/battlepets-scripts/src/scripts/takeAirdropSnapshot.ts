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

type AirdropEntries = {
  address: string
  twitter: string
  referral: string
}[]

const argv = yargs(process.argv.slice(2)).options({
  fileName: { type: 'string', demandOption: true },
  id: { type: 'string' },
})

const takeAirdropSnapshot = async () => {
  const { fileName, id } = await argv.parse()

  const airdropEntriesFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${fileName}.csv`)

  const airdropEntries = (await csvToJson().fromFile(airdropEntriesFilePath)) as AirdropEntries

  const airdropAllocations = airdropEntries
    .filter(({ address, referral, twitter }, index, self) => {
      if (!address) {
        throw new Error('Missing entry address!')
      }
      if (!twitter) {
        throw new Error('Missing entry Twitter username!')
      }

      return (
        twitter !== referral &&
        index === self.findIndex(airdropEntry => airdropEntry.address === address || airdropEntry.twitter === twitter)
      )
    })
    .map(({ address, twitter }, _index, self) => ({
      address,
      weight: Math.min(
        1 + self.filter(airdropEntry => airdropEntry.referral && airdropEntry.referral === twitter).length * 0.1,
        10
      ),
      status: 'pending',
    }))

  const airdropCsv = csvStringify(airdropAllocations, {
    columns: ['address', 'weight', 'status'],
    header: true,
  })

  const airdropSnapshotFilePath = getAirdropSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(airdropSnapshotFilePath, airdropCsv)

  console.log(`Airdrop snapshot taken and saved at ${path.relative(__dirname, airdropSnapshotFilePath)}!`.green)
}

executeScript(takeAirdropSnapshot)
