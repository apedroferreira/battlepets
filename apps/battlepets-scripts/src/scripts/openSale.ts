import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import saleIdl from 'battlepets-shared/idls/battlepets_sale.json'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString } from '@/utils/solanaUtils'

import type { BattlepetsSale } from 'battlepets-shared/types/battlepets_sale'

const openSale = async () => {
  if (!process.env.TOKEN_WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const fundRaiserAccount = getKeypairFromEnvironment('TOKEN_WALLET_SECRET_KEY')

  const provider = new anchor.AnchorProvider(connection, new NodeWallet(fundRaiserAccount))
  anchor.setProvider(provider)

  const saleProgram = new anchor.Program(saleIdl as anchor.Idl as BattlepetsSale, provider)

  const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const explorerURLQueryString = getExplorerURLQueryString()

  const openSaleTransactionSignature = await saleProgram.methods
    .openSale()
    .accounts({
      sale: salePda,
      fundRaiser: fundRaiserAccount.publicKey,
    })
    .rpc()

  console.log(
    `Open Sale Transaction: https://explorer.solana.com/tx/${openSaleTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(openSale)
