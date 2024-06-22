import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { INITIAL_TOKEN_DISTRIBUTION } from '@/common/constants'
import { TokenDistribution } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, multiSendTokens } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  amount: { type: 'number' },
})

const distributeTokens = async () => {
  const { amount = null } = await argv.parse()

  if (!process.env.TOKEN_WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const senderAccount = getKeypairFromEnvironment('TOKEN_WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const senderTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    senderAccount,
    tokenMint.address,
    senderAccount.publicKey
  )

  const tokenAmount =
    amount ?? (await connection.getTokenAccountBalance(senderTokenAccount.address)).value.uiAmount ?? 0

  const initialDistributionReceivers = Object.entries(INITIAL_TOKEN_DISTRIBUTION).map(
    ([tokenDistribution, { walletAddress: tokenDistributionAddress }]) => {
      if (!tokenDistributionAddress) {
        throw new Error(`Missing token distribution address for ${tokenDistribution}!`)
      }

      const publicKey = new web3.PublicKey(tokenDistributionAddress)

      return {
        publicKey,
        amount: tokenAmount * INITIAL_TOKEN_DISTRIBUTION[tokenDistribution as TokenDistribution].allocation,
      }
    }
  )

  const transactionResults = await multiSendTokens(
    connection,
    senderAccount,
    tokenPublicKey,
    initialDistributionReceivers
  )

  if (transactionResults[0].status === 'rejected') {
    throw new Error(transactionResults[0].reason as string)
  }

  const initialDistributionTransactionSignature = transactionResults[0].value.result

  console.log(
    `Initial Distribution Token Transaction: https://explorer.solana.com/tx/${initialDistributionTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(distributeTokens)
