import fs from 'fs/promises'
import path from 'path'

import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import saleIdl from 'battlepets-shared/idls/battlepets_sale.json'
import { stringify as csvStringify } from 'csv-stringify'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { getConnection } from '@/utils/solanaUtils'

import type { BattlepetsSale } from 'battlepets-shared/types/battlepets_sale'

const getSaleSnapshotFilePath = (id?: string) =>
  path.resolve(__dirname, `./scriptsData/output/${Date.now()}_sale${id ? `_${id}` : ''}.csv`)

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string' },
  minSOLAmount: { type: 'number' },
})

const takeSaleSnapshot = async () => {
  const { id, minSOLAmount = 0 } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const saleAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const provider = new anchor.AnchorProvider(connection, new NodeWallet(saleAccount))
  anchor.setProvider(provider)

  const saleProgram = new anchor.Program(saleIdl as anchor.Idl as BattlepetsSale, provider)

  const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const { open: isSaleOpen } = await saleProgram.account.saleState.fetch(salePda)

  if (isSaleOpen) {
    throw new Error('Sale must be closed before taking snapshot!')
  }

  const saleAllocations = await saleProgram.account.saleAllocationState.all()

  const eligibleAccounts = [
    ...saleAllocations
      .map(allocation => ({
        address: allocation.account.contributor.toString(),
        amount: Number(allocation.account.amount) / web3.LAMPORTS_PER_SOL,
      }))
      .filter(account => account.amount >= minSOLAmount),
  ].sort((a, b) => b.amount - a.amount)

  const eligibleAccountsCsv = csvStringify(eligibleAccounts, {
    columns: ['address', 'amount'],
    header: true,
  })

  const saleSnapshotFilePath = getSaleSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(saleSnapshotFilePath, eligibleAccountsCsv)

  console.log(`Sale snapshot taken and saved at ${path.relative(__dirname, saleSnapshotFilePath)}!`.green)
}

executeScript(takeSaleSnapshot)
