import 'dotenv/config'

import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'colors'

import { INITIAL_TOKEN_DISTRIBUTION, TOKEN_AMOUNT, TOKEN_DECIMALS } from '@/common/constants'
import { TokenDistribution } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, getTokenAmount, multiSendTokens } from '@/utils/solanaUtils'

const createToken = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMintAddress = await token.createMint(
    connection,
    ownerAccount,
    ownerAccount.publicKey,
    null,
    TOKEN_DECIMALS
  )

  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMintAddress.toString()}${explorerURLQueryString}`.green
  )

  const ownerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    ownerAccount,
    tokenMintAddress,
    ownerAccount.publicKey
  )

  const mintTransactionSignature = await token.mintTo(
    connection,
    ownerAccount,
    tokenMintAddress,
    ownerTokenAccount.address,
    ownerAccount,
    getTokenAmount(TOKEN_AMOUNT)
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}${explorerURLQueryString}`.green
  )

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

  const initialDistributionTransactionSignature = await multiSendTokens(
    connection,
    ownerAccount,
    tokenMintAddress,
    initialDistributionReceivers
  )

  console.log(
    `Initial Distribution Token Transaction: https://explorer.solana.com/tx/${initialDistributionTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(createToken)
