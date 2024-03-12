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
import {
  RpcConfirmTransactionResult,
  TransactionBuilder,
  TransactionSignature,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

import { CLUSTER, MASTER_NFTS } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import {
  getAirdropPendingReceivers,
  getExplorerURLQueryString,
  updateSuccessfulAirdropReceivers,
} from '@/utils/solanaUtils'

const MAX_AIRDROPS_PER_TRANSACTION = 1

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(MASTER_NFTS), demandOption: true },
  fileName: { type: 'string', demandOption: true },
})

const sendNFTAirdrop = async (): Promise<void> => {
  const { fileName, id } = await argv.parse()

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

  const masterNFTAddress = MASTER_NFTS[id as keyof typeof MASTER_NFTS]
  const masterNFTPublicKey = publicKey(masterNFTAddress)

  const masterEdition = await fetchMasterEditionFromSeeds(umi, {
    mint: masterNFTPublicKey,
  })

  const masterEditionSupply = Number(masterEdition.supply)

  const pendingReceiverPublicKeys = await getAirdropPendingReceivers(fileName)

  const firstCopyMint = generateSigner(umi)

  const nftAirdropTransactions: { transaction: TransactionBuilder; receiverAddresses: string[] }[] = []

  let currentTransactionIndex = 0
  for (let copyIndex = 0; copyIndex < pendingReceiverPublicKeys.length; copyIndex++) {
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
      destinationOwner: fromWeb3JsPublicKey(pendingReceiverPublicKeys[copyIndex]),
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    })

    const updateNFTPrimarySaleInstruction = updateV1(umi, {
      mint: editionMint.publicKey,
      primarySaleHappened: true,
    })

    const currentTransaction = nftAirdropTransactions[currentTransactionIndex] ?? {
      transaction: new TransactionBuilder(),
      receiverAddresses: [],
    }
    nftAirdropTransactions[currentTransactionIndex] = {
      transaction: currentTransaction.transaction.add([
        printNFTInstruction,
        transferNFTInstruction,
        updateNFTPrimarySaleInstruction,
      ]),
      receiverAddresses: [...currentTransaction.receiverAddresses, pendingReceiverPublicKeys[copyIndex].toString()],
    }

    if ((copyIndex + 1) % MAX_AIRDROPS_PER_TRANSACTION === 0) {
      currentTransactionIndex++
    }
  }

  const transactionResults = await Promise.allSettled(
    nftAirdropTransactions.map(async ({ receiverAddresses, transaction }) => {
      const transactionResult = await transaction.sendAndConfirm(umi)

      return { result: transactionResult, receiverAddresses }
    })
  )

  const successfulTransactions = transactionResults
    .filter(result => result.status === 'fulfilled')
    .map(
      result =>
        (
          result as PromiseFulfilledResult<{
            result: {
              signature: TransactionSignature
              result: RpcConfirmTransactionResult
            }
            receiverAddresses: string[]
          }>
        ).value
    )

  const successfulAirdroppedAddresses = successfulTransactions.flatMap(({ receiverAddresses }) => receiverAddresses)

  await updateSuccessfulAirdropReceivers(fileName, successfulAirdroppedAddresses)

  const transactionCount = transactionResults.length
  const successfulTransactionCount = successfulTransactions.length
  const failedTransactionCount = transactionCount - successfulTransactionCount

  console.log(`NFTs airdropped in ${pluralize(transactionCount, 'transaction')}:`.cyan)
  if (successfulTransactionCount > 0) {
    console.log(`${pluralize(successfulTransactionCount, 'transaction')} successful.`.green)
  }
  if (failedTransactionCount > 0) {
    console.log(`${pluralize(failedTransactionCount, 'transaction')} failed.`.red)
  }

  if (successfulTransactionCount >= 1) {
    const [
      {
        result: { signature: nftAirdropFirstTransactionSignature },
      },
    ] = successfulTransactions

    console.log(
      `Airdrop First Successful Transaction: https://explorer.solana.com/tx/${bs58.encode(nftAirdropFirstTransactionSignature)}${explorerURLQueryString}`
        .cyan
    )

    console.log(
      `First Successful Airdropped NFT Mint: https://explorer.solana.com/address/${firstCopyMint.publicKey.toString()}${explorerURLQueryString}`
        .green
    )
  }
}

executeScript(sendNFTAirdrop)
