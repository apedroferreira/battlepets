import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'

import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { stringify as csvStringify } from 'csv-stringify'
import { sort } from 'ramda'
import yargs from 'yargs'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getTokenUIAmount } from '@/utils/solanaUtils'

const getSnapshotFilePath = (id?: string) =>
  path.resolve(__dirname, `./scriptsData/snapshots/${Date.now()}${id ? `_${id}` : ''}.csv`)

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string' },
  minAmount: { type: 'number' },
})

const takeTokenHoldersSnapshot = async (): Promise<void> => {
  const { id, minAmount = 0 } = await argv.parse()

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const tokenAccounts = await connection.getProgramAccounts(token.TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: token.ACCOUNT_SIZE,
      },
      {
        memcmp: {
          offset: 0,
          bytes: tokenMint.address.toString(),
        },
      },
    ],
  })

  const eligibleAccounts = sort(
    (a, b) => b.amount - a.amount,
    tokenAccounts
      .map(tokenAccount => {
        const tokenAccountData = token.AccountLayout.decode(tokenAccount.account.data)

        return {
          address: tokenAccountData.owner.toString(),
          amount: getTokenUIAmount(Number(tokenAccountData.amount)),
        }
      })
      .filter(account => account.amount > 0 && account.amount >= minAmount)
  )

  const eligibleAccountsCsv = csvStringify(eligibleAccounts, {
    columns: ['address', 'amount'],
    header: true,
  })

  const snapshotFilePath = getSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(snapshotFilePath, eligibleAccountsCsv)

  console.log(`Snapshot taken and saved at ${path.relative(__dirname, snapshotFilePath)}!`.green)
}

executeScript(takeTokenHoldersSnapshot)
