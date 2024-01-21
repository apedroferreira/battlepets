import 'dotenv/config'

import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment, requestAndConfirmAirdrop } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

import { executeScript } from 'utils/scriptUtils'
import { getConnection } from 'utils/solanaUtils'

const parser = yargs(process.argv.slice(2)).options({
  amount: { type: 'number' },
})

const getDevSOLAirdrop = async (): Promise<void> => {
  const argv = parser.argv

  const { amount = 1 } = await argv

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const receiverAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  await requestAndConfirmAirdrop(connection, receiverAccount.publicKey, amount * web3.LAMPORTS_PER_SOL)

  console.log(`${amount} SOL airdropped!`.green)
}

executeScript(getDevSOLAirdrop)
