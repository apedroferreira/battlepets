import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { SOL_TOKEN_EXCHANGE_RATE } from '@/common/constants'
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
  maxReceiversPerTransaction: { type: 'number' },
})

const distributeSale = async () => {
  const { fileName, maxReceiversPerTransaction = Infinity } = await argv.parse()

  if (!process.env.TOKEN_WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const saleAccount = getKeypairFromEnvironment('TOKEN_WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const pendingReceivers = await getAirdropPendingReceivers(fileName, ['amount'])

  const pendingReceiversWithAmount = pendingReceivers.map(({ amount = 0, publicKey }) => ({
    publicKey,
    amount: Number(amount) * SOL_TOKEN_EXCHANGE_RATE,
  }))

  const transactionResults = await multiSendTokens(
    connection,
    saleAccount,
    tokenMint.address,
    pendingReceiversWithAmount,
    maxReceiversPerTransaction
  )

  const { failedTransactionReasons, successfulTransactions } = await updateSuccessfulAirdropReceivers(
    fileName,
    transactionResults,
    ['amount']
  )

  const transactionCount = transactionResults.length
  const successfulTransactionCount = successfulTransactions.length
  const failedTransactionCount = transactionCount - successfulTransactionCount

  if (transactionCount > 0) {
    console.log(`Sale distribution in ${pluralize(transactionCount, 'transaction')}:`.cyan)
  } else {
    console.log('No transactions to make!'.cyan)
  }

  if (successfulTransactionCount > 0) {
    console.log(`${pluralize(successfulTransactionCount, 'transaction')} successful.`.green)
  }
  if (failedTransactionCount > 0) {
    console.log(`${pluralize(failedTransactionCount, 'transaction')} failed.`.red)
    console.error(`${failedTransactionReasons[0]}`.red)
  }

  if (successfulTransactionCount > 0) {
    const [{ result: distributeTokenFirstTransactionSignature }] = successfulTransactions

    console.log(
      `Distribute Token First Successful Transaction: https://explorer.solana.com/tx/${distributeTokenFirstTransactionSignature}${explorerURLQueryString}`
        .cyan
    )
  }
}

executeScript(distributeSale)
