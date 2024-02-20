import 'dotenv/config'

import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment, requestAndConfirmAirdrop } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'
import { getConnection } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2))
  .options({
    amount: { type: 'number' },
  })
  .check(argv => {
    if (argv.amount && argv.amount <= 0) {
      throw new Error('"amount" option must be a positive number!')
    }
    return true
  })

const getDevSOLAirdrop = async (): Promise<void> => {
  const { amount = 2 } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const receiverAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const lamportsBalanceBefore = await connection.getBalance(receiverAccount.publicKey)

  const lamportsBalanceAfter = await requestAndConfirmAirdrop(
    connection,
    receiverAccount.publicKey,
    amount * web3.LAMPORTS_PER_SOL
  )

  const solBalanceAfter = lamportsBalanceAfter / web3.LAMPORTS_PER_SOL
  const solAidropped = (lamportsBalanceAfter - lamportsBalanceBefore) / web3.LAMPORTS_PER_SOL

  console.log(`${solAidropped} SOL airdropped! Account now has ${solBalanceAfter} SOL.`.green)
}

executeScript(getDevSOLAirdrop)
