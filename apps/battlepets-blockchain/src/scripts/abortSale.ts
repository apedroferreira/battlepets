import 'dotenv/config'

import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import saleIdl from 'battlepets-shared/idls/battlepets_public_sale.json'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, multiSendSOL } from '@/utils/solanaUtils'

import type { BattlepetsPublicSale } from 'battlepets-shared/types/battlepets_public_sale'

const abortSale = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.SALE_PROGRAM_ID) {
    throw new Error('Must set sale program ID!')
  }

  const connection = getConnection()

  const fundRaiserAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const provider = new anchor.AnchorProvider(connection, new NodeWallet(fundRaiserAccount), {})
  anchor.setProvider(provider)

  const saleProgram = new anchor.Program(
    saleIdl as anchor.Idl as BattlepetsPublicSale,
    process.env.SALE_PROGRAM_ID,
    provider
  )

  const [salePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const explorerURLQueryString = getExplorerURLQueryString()

  const { open: isSaleOpen } = await saleProgram.account.saleState.fetch(salePda)

  if (isSaleOpen) {
    throw new Error('Sale must be closed before abortion!')
  }

  const saleAllocations = await saleProgram.account.saleAllocationState.all()

  const refundReceivers = saleAllocations.map(allocation => ({
    publicKey: allocation.account.contributor,
    lamports: Number(allocation.account.amount),
  }))

  const abortSaleTransactionSignature = await multiSendSOL(connection, fundRaiserAccount, refundReceivers)

  console.log(
    `Sale Abortion Token Transaction: https://explorer.solana.com/tx/${abortSaleTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(abortSale)
