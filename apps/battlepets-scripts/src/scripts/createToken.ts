import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { INITIAL_TOKEN_DISTRIBUTION, TOKEN_AMOUNT, TOKEN_DECIMALS } from '@/common/constants'
import { TokenDistribution } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, getTokenAmount, multiSendTokens } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  skipDistribution: { type: 'boolean' },
})

const createToken = async () => {
  const { skipDistribution = false } = await argv.parse()

  if (!process.env.TOKEN_WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('TOKEN_WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  let tokenPublicKey = process.env.TOKEN_ADDRESS ? new web3.PublicKey(process.env.TOKEN_ADDRESS) : null
  if (!tokenPublicKey) {
    tokenPublicKey = await token.createMint(connection, ownerAccount, ownerAccount.publicKey, null, TOKEN_DECIMALS)

    console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenPublicKey.toString()}${explorerURLQueryString}`.green
    )
  }

  const ownerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    ownerAccount,
    tokenPublicKey,
    ownerAccount.publicKey
  )

  const mintTransactionSignature = await token.mintTo(
    connection,
    ownerAccount,
    tokenPublicKey,
    ownerTokenAccount.address,
    ownerAccount,
    getTokenAmount(TOKEN_AMOUNT)
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}${explorerURLQueryString}`.green
  )

  if (!skipDistribution) {
    const initialDistributionReceivers = Object.entries(INITIAL_TOKEN_DISTRIBUTION).map(
      ([tokenDistribution, { walletAddress: tokenDistributionAddress }]) => {
        if (!tokenDistributionAddress) {
          throw new Error(`Missing token distribution address for ${tokenDistribution}!`)
        }

        const publicKey = new web3.PublicKey(tokenDistributionAddress)

        return {
          publicKey,
          amount: TOKEN_AMOUNT * INITIAL_TOKEN_DISTRIBUTION[tokenDistribution as TokenDistribution].allocation,
        }
      }
    )

    const transactionResults = await multiSendTokens(
      connection,
      ownerAccount,
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
}

executeScript(createToken)
