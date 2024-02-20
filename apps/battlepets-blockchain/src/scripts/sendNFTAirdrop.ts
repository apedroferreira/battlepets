import 'dotenv/config'

import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  TokenStandard,
  fetchMasterEditionFromSeeds,
  mplTokenMetadata,
  printV2,
  transferV1,
  updateV1,
} from '@metaplex-foundation/mpl-token-metadata'
import { TransactionBuilder, createSignerFromKeypair, generateSigner, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

import { CLUSTER } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getExplorerURLQueryString, getValidAirdropReceivers } from '@/utils/solanaUtils'

const MAX_AIRDROPS_PER_TRANSACTION = 1

const argv = yargs(process.argv.slice(2)).options({
  masterNFTAddress: { type: 'string', demandOption: true },
  fileName: { type: 'string', demandOption: true },
})

const sendNFTAirdrop = async (): Promise<void> => {
  const { fileName, masterNFTAddress } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  const umi = createUmi(getEndpoint(CLUSTER))

  const mplTokenMetadataPlugin = mplTokenMetadata()
  umi.use(mplTokenMetadataPlugin)

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const masterNFTPublicKey = publicKey(masterNFTAddress)

  const masterEdition = await fetchMasterEditionFromSeeds(umi, {
    mint: masterNFTPublicKey,
  })

  const masterEditionSupply = Number(masterEdition.supply)

  const validReceiverPublicKeys = await getValidAirdropReceivers(fileName)

  const firstCopyMint = generateSigner(umi)

  const nftAirdropTransactions: TransactionBuilder[] = []

  let currentTransactionIndex = 0
  for (let copyIndex = 0; copyIndex < validReceiverPublicKeys.length; copyIndex++) {
    const editionMint = copyIndex === 0 ? firstCopyMint : generateSigner(umi)

    const printNFTInstruction = printV2(umi, {
      masterTokenAccountOwner: umiSigner,
      masterEditionMint: masterNFTPublicKey,
      editionMint,
      editionTokenAccountOwner: umiSigner.publicKey,
      editionNumber: masterEditionSupply + copyIndex + 1,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    })

    const transferNFTInstruction = transferV1(umi, {
      mint: editionMint.publicKey,
      authority: umiSigner,
      tokenOwner: umiSigner.publicKey,
      destinationOwner: fromWeb3JsPublicKey(validReceiverPublicKeys[copyIndex]),
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    })

    const updateNFTPrimarySaleInstruction = updateV1(umi, {
      mint: editionMint.publicKey,
      primarySaleHappened: true,
    })

    const currentTransaction = nftAirdropTransactions[currentTransactionIndex] ?? new TransactionBuilder()
    nftAirdropTransactions[currentTransactionIndex] = currentTransaction.add([
      printNFTInstruction,
      transferNFTInstruction,
      updateNFTPrimarySaleInstruction,
    ])

    if ((copyIndex + 1) % MAX_AIRDROPS_PER_TRANSACTION === 0) {
      currentTransactionIndex++
    }
  }

  const [{ signature: nftAirdropFirstTransactionSignature }] = await Promise.all(
    nftAirdropTransactions.map(transaction => transaction.sendAndConfirm(umi))
  )

  const transactionCount = nftAirdropTransactions.length

  console.log(`NFTs airdropped in ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}!`.cyan)
  console.log(
    `Airdrop First Transaction: https://explorer.solana.com/tx/${bs58.encode(nftAirdropFirstTransactionSignature)}${explorerURLQueryString}`
      .cyan
  )

  console.log(
    `First Airdropped NFT Mint: https://explorer.solana.com/address/${firstCopyMint.publicKey.toString()}${explorerURLQueryString}`
      .green
  )
}

executeScript(sendNFTAirdrop)
