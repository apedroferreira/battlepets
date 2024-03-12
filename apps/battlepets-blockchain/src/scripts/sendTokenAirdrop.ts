import 'dotenv/config'

import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import yargs from 'yargs'
import 'colors'

import { INITIAL_TOKEN_DISTRIBUTION, TOKEN_AMOUNT } from '@/common/constants'
import { TokenDistribution } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import {
  getAirdropPendingReceivers,
  getConnection,
  getExplorerURLQueryString,
  multiSendTokens,
  updateSuccessfulAirdropReceivers,
} from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  fileName: { type: 'string', demandOption: true },
})

const sendTokenAirdrop = async (): Promise<void> => {
  const { fileName } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const senderAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const pendingReceiverPublicKeys = await getAirdropPendingReceivers(fileName)

  const airdropAmount = TOKEN_AMOUNT * INITIAL_TOKEN_DISTRIBUTION[TokenDistribution.AIRDROP].allocation
  const individualAirdropAmount = airdropAmount / pendingReceiverPublicKeys.length

  const pendingReceivers = pendingReceiverPublicKeys.map(publicKey => ({
    publicKey,
    amount: individualAirdropAmount,
  }))

  const airdropTransactionSignature = await multiSendTokens(
    connection,
    senderAccount,
    tokenMint.address,
    pendingReceivers
  )

  await updateSuccessfulAirdropReceivers(
    fileName,
    pendingReceivers.map(({ publicKey }) => publicKey.toString())
  )

  console.log(
    `Airdrop Token Transaction: https://explorer.solana.com/tx/${airdropTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(sendTokenAirdrop)
