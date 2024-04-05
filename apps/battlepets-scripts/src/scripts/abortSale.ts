import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import {
  getAirdropPendingReceivers,
  getConnection,
  getExplorerURLQueryString,
  multiSendSOL,
  updateSuccessfulAirdropReceivers,
} from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  fileName: { type: 'string', demandOption: true },
  maxReceiversPerTransaction: { type: 'number' },
})

const abortSale = async () => {
  const { fileName, maxReceiversPerTransaction = Infinity } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const fundRaiserAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  const pendingReceivers = await getAirdropPendingReceivers(fileName, ['amount'])

  const pendingReceiversWithLamports = pendingReceivers.map(({ amount = 0, publicKey }) => ({
    publicKey,
    lamports: Number(amount) * web3.LAMPORTS_PER_SOL,
  }))

  const transactionResults = await multiSendSOL(
    connection,
    fundRaiserAccount,
    pendingReceiversWithLamports,
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
    console.log(`Sale abortion in ${pluralize(transactionCount, 'transaction')}:`.cyan)
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
    const [{ result: refundTokenFirstTransactionSignature }] = successfulTransactions

    console.log(
      `Refund Token First Successful Transaction: https://explorer.solana.com/tx/${refundTokenFirstTransactionSignature}${explorerURLQueryString}`
        .cyan
    )
  }
}

executeScript(abortSale)
