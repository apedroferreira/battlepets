import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, getTokenAmount } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2))
  .options({
    amount: {
      type: 'number',
      demandOption: true,
    },
  })
  .check(argv => {
    if (argv.amount <= 0) {
      throw new Error('"amount" option must be a positive number!')
    }
    return true
  })

const burnTokens = async (): Promise<void> => {
  const { amount } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const burnerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const burnerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    burnerAccount,
    tokenMint.address,
    burnerAccount.publicKey
  )

  const burnTransactionSignature = await token.burn(
    connection,
    burnerAccount,
    burnerTokenAccount.address,
    tokenMint.address,
    burnerAccount,
    getTokenAmount(amount)
  )

  console.log(
    `Burn Token Transaction: https://explorer.solana.com/tx/${burnTransactionSignature}${explorerURLQueryString}`.green
  )
}

executeScript(burnTokens)
