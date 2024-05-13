import fs from 'fs/promises'
import path from 'path'

import { JsonMetadata, Metadata, fetchJsonMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { Umi, createGenericFile, createGenericFileFromJson } from '@metaplex-foundation/umi'
import { createIrysUploader } from '@metaplex-foundation/umi-uploader-irys'
import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { LOCALNET_ENDPOINT } from 'battlepets-shared/constants'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import { stringify as csvStringify } from 'csv-stringify'
import csvToJson from 'csvtojson'

import { CLUSTER, TOKEN_DECIMALS } from '@/common/constants'

import type { EnhancedOmit, RequiredFields } from 'battlepets-shared/utils/typeUtils'

export const getConnection = () =>
  new web3.Connection(getEndpoint(CLUSTER), {
    commitment: 'confirmed',
  })

export const getExplorerURLQueryString = () => {
  switch (CLUSTER) {
    case 'mainnet-beta':
      return ''
    case 'testnet':
      return `?${new URLSearchParams({
        cluster: 'testnet',
      }).toString()}`
    case 'devnet':
      return `?${new URLSearchParams({
        cluster: 'devnet',
      }).toString()}`
    default:
      return `?${new URLSearchParams({
        cluster: 'custom',
        customUrl: encodeURIComponent(LOCALNET_ENDPOINT),
      }).toString()}`
  }
}

export const getTokenAmount = (uiAmount: number) => Math.floor(uiAmount * 10 ** TOKEN_DECIMALS)

export const getTokenUIAmount = (amount: number) => amount / 10 ** TOKEN_DECIMALS

export const multiSendSOL = async (
  connection: web3.Connection,
  senderAccount: web3.Keypair,
  receivers: { publicKey: web3.PublicKey; lamports: number }[],
  maxReceiversPerTransaction = Infinity
) => {
  const multiSendTransactions: { transaction: web3.Transaction; receiverAddresses: string[] }[] = []

  let currentTransactionIndex = 0
  for (let receiverIndex = 0; receiverIndex < receivers.length; receiverIndex++) {
    const { lamports, publicKey } = receivers[receiverIndex]

    const sendSolInstruction = web3.SystemProgram.transfer({
      fromPubkey: senderAccount.publicKey,
      toPubkey: publicKey,
      lamports,
    })

    const currentTransaction = multiSendTransactions[currentTransactionIndex] ?? {
      transaction: new web3.Transaction(),
      receiverAddresses: [],
    }
    multiSendTransactions[currentTransactionIndex] = {
      transaction: currentTransaction.transaction.add(sendSolInstruction),
      receiverAddresses: [...currentTransaction.receiverAddresses, publicKey.toString()],
    }

    if ((receiverIndex + 1) % maxReceiversPerTransaction === 0) {
      currentTransactionIndex++
    }
  }

  const transactionResults = await Promise.allSettled(
    multiSendTransactions.map(async ({ receiverAddresses, transaction }) => {
      const transactionResult = await web3.sendAndConfirmTransaction(connection, transaction, [senderAccount])

      return { result: transactionResult, receiverAddresses }
    })
  )

  return transactionResults
}

export const multiSendTokens = async (
  connection: web3.Connection,
  senderAccount: web3.Keypair,
  tokenMintAddress: web3.PublicKey,
  receivers: { publicKey: web3.PublicKey; amount: number }[],
  maxReceiversPerTransaction = Infinity
) => {
  const senderTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    senderAccount,
    tokenMintAddress,
    senderAccount.publicKey
  )

  const receiverInfos = await Promise.all(
    receivers.map(async ({ amount, publicKey }) => ({
      publicKey,
      tokenAddress: await token.getAssociatedTokenAddress(tokenMintAddress, publicKey, false),
      amount,
    }))
  )

  const multiSendTransactions: { transaction: web3.Transaction; receivers: { address: string; amount: number }[] }[] =
    []

  let currentTransactionIndex = 0
  for (let receiverIndex = 0; receiverIndex < receivers.length; receiverIndex++) {
    const { amount, publicKey, tokenAddress } = receiverInfos[receiverIndex]

    const createTransferInstruction = token.createTransferInstruction(
      senderTokenAccount.address,
      tokenAddress,
      senderAccount.publicKey,
      getTokenAmount(amount)
    )

    const receiverTokenAccountInfo = await connection.getAccountInfo(tokenAddress)

    const currentTransaction = multiSendTransactions[currentTransactionIndex] ?? {
      transaction: new web3.Transaction(),
      receivers: [],
    }

    let sendTokenInstructions = [createTransferInstruction]
    if (!receiverTokenAccountInfo) {
      sendTokenInstructions = [
        token.createAssociatedTokenAccountInstruction(
          senderAccount.publicKey,
          tokenAddress,
          publicKey,
          tokenMintAddress
        ),
        createTransferInstruction,
      ]
    }

    multiSendTransactions[currentTransactionIndex] = {
      transaction: currentTransaction.transaction.add(...sendTokenInstructions),
      receivers: [...currentTransaction.receivers, { address: publicKey.toString(), amount }],
    }

    if ((receiverIndex + 1) % maxReceiversPerTransaction === 0) {
      currentTransactionIndex++
    }
  }

  const transactionResults = await Promise.allSettled(
    multiSendTransactions.map(async ({ receivers, transaction }) => {
      const transactionResult = await web3.sendAndConfirmTransaction(connection, transaction, [senderAccount])

      return { result: transactionResult, receivers }
    })
  )

  return transactionResults
}

type AirdropReceivers<ExtraFields extends string[]> = ({
  address: string
  status: 'pending' | 'sent' | 'duplicate' | 'invalidFormat' | 'notOnCurve'
  airdropAmount?: number
} & Record<ExtraFields[number], string>)[]

export const getAirdropPendingReceivers = async <ExtraFields extends string[]>(
  airdropFileName: string,
  extraFields: ExtraFields = [] as string[] as ExtraFields
) => {
  const airdropAddressesFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${airdropFileName}.csv`)

  const airdropReceivers = (await csvToJson().fromFile(airdropAddressesFilePath)) as AirdropReceivers<ExtraFields>

  let processedReceiverAddresses: string[] = []

  const updatedAirdropReceivers = airdropReceivers.map(airdropReceiver => {
    const { address: receiverAddress, airdropAmount, status: receiverStatus, ...extraData } = airdropReceiver

    if (!receiverAddress) {
      throw new Error('Missing receiver address!')
    }
    if (!receiverStatus) {
      throw new Error('Missing receiver status!')
    }

    if (receiverStatus !== 'pending') {
      processedReceiverAddresses = [...processedReceiverAddresses, receiverAddress]
      return airdropReceiver
    }

    let newStatus = 'pending'

    if (processedReceiverAddresses.includes(receiverAddress)) {
      newStatus = 'duplicate'
    }

    let receiverPublicKey = null
    try {
      receiverPublicKey = new web3.PublicKey(receiverAddress)
    } catch (error) {
      newStatus = 'invalidFormat'
    }

    if (receiverPublicKey && !web3.PublicKey.isOnCurve(receiverPublicKey)) {
      newStatus = 'notOnCurve'
    }

    processedReceiverAddresses = [...processedReceiverAddresses, receiverAddress]

    return {
      address: receiverAddress,
      ...extraData,
      status: newStatus,
      airdropAmount,
    }
  })

  const updatedAirdropReceiversCsv = csvStringify(updatedAirdropReceivers, {
    columns: ['address', ...extraFields, 'status', 'airdropAmount'],
    header: true,
  })

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(airdropAddressesFilePath, updatedAirdropReceiversCsv)

  return updatedAirdropReceivers
    .filter(({ status: receiverStatus }) => receiverStatus === 'pending')
    .map(({ address: receiverAddress, ...extraData }) => ({
      publicKey: new web3.PublicKey(receiverAddress),
      ...extraData,
    }))
}

export const updateSuccessfulAirdropReceivers = async <
  AirdropTransactionResult extends { receivers: { address: string; amount: number }[] },
  ExtraFields extends string[],
>(
  airdropFileName: string,
  airdropTransactionResults: PromiseSettledResult<AirdropTransactionResult>[],
  extraFields: ExtraFields = [] as string[] as ExtraFields
) => {
  const successfulTransactions = airdropTransactionResults
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<AirdropTransactionResult>).value)

  const failedTransactionReasons = airdropTransactionResults
    .filter(result => result.status === 'rejected')
    .map(result => (result as PromiseRejectedResult).reason as string)

  const successfulReceivers = successfulTransactions.flatMap(({ receivers }) => receivers)

  const airdropAddressesFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${airdropFileName}.csv`)

  const airdropReceivers = (await csvToJson().fromFile(airdropAddressesFilePath)) as AirdropReceivers<ExtraFields>

  const updatedAirdropReceivers = airdropReceivers.map(airdropReceiverData => {
    const { address: receiverAddress, status: receiverStatus, ...extraData } = airdropReceiverData

    if (!receiverAddress) {
      throw new Error('Missing receiver address!')
    }
    if (!receiverStatus) {
      throw new Error('Missing receiver status!')
    }

    if (receiverStatus === 'pending' && successfulReceivers.some(receiver => receiver.address === receiverAddress)) {
      return {
        address: receiverAddress,
        ...extraData,
        status: 'sent',
        airdropAmount: successfulReceivers.find(receiver => receiver.address === receiverAddress)!.amount,
      }
    }

    return airdropReceiverData
  })

  const updatedAirdropReceiversCsv = csvStringify(updatedAirdropReceivers, {
    columns: ['address', ...extraFields, 'status', 'airdropAmount'],
    header: true,
  })

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(airdropAddressesFilePath, updatedAirdropReceiversCsv)

  return {
    successfulTransactions,
    failedTransactionReasons,
  }
}

const getUploaderAddress = () =>
  CLUSTER === 'mainnet-beta' ? 'https://arweave.mainnet.irys.xyz' : 'https://arweave.devnet.irys.xyz'

const getMutableUploadedFileUri = (uri: string) =>
  uri.replace('https://arweave.net', 'https://gateway.irys.xyz/mutable')

const getUriTransactionId = (uri: string) => uri.split('/').pop() ?? ''

export const uploadMetadata = async (
  umi: Umi,
  id: string,
  jsonMetadata: RequiredFields<EnhancedOmit<JsonMetadata, 'image'>, 'name' | 'symbol' | 'description'>,
  hasProperties = false,
  existingMetadata?: Metadata,
  skipImageUpload = false,
  skipJsonUpload = false
) => {
  const uploader = createIrysUploader(umi, {
    address: getUploaderAddress(),
    providerUrl: getEndpoint(CLUSTER),
    timeout: 60000,
  })

  const existingJsonMetadata = existingMetadata && (await fetchJsonMetadata(umi, existingMetadata.uri))

  let mutableImageUri = existingJsonMetadata?.image
  if (!mutableImageUri || !skipImageUpload) {
    const imageFilePath = path.resolve(__dirname, `../assets/images/${id}.png`)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const tokenImageBuffer = await fs.readFile(imageFilePath)
    const tokenImageFile = createGenericFile(
      tokenImageBuffer,
      `${id}.png`,
      existingJsonMetadata?.image
        ? {
            tags: [
              {
                name: 'Root-TX',
                value: getUriTransactionId(existingJsonMetadata.image),
              },
            ],
          }
        : {}
    )

    const [imageUri] = await uploader.upload([tokenImageFile])

    mutableImageUri = getMutableUploadedFileUri(imageUri)

    console.log(`Image uploaded to ${mutableImageUri}`.cyan)
  }

  let mutableMetadataUri = existingMetadata?.uri
  if (!mutableMetadataUri || !skipJsonUpload) {
    const newJsonMetadata = {
      ...(existingJsonMetadata ?? {}),
      name: jsonMetadata.name,
      symbol: jsonMetadata.symbol,
      description: jsonMetadata.description,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      ...(jsonMetadata.seller_fee_basis_points || jsonMetadata.seller_fee_basis_points === 0
        ? { seller_fee_basis_points: jsonMetadata.seller_fee_basis_points }
        : {}),
      image: mutableImageUri,
      ...(jsonMetadata.animation_url ? { animation_url: jsonMetadata.animation_url } : {}),
      ...(jsonMetadata.external_url ? { external_url: jsonMetadata.external_url } : {}),
      ...(jsonMetadata.attributes ? { attributes: jsonMetadata.attributes } : {}),
      ...(jsonMetadata.collection ? { collection: jsonMetadata.collection } : {}),
      ...(hasProperties
        ? {
            properties: {
              files: [{ uri: mutableImageUri, type: 'image/png' }],
              category: 'image',
              creators: [
                {
                  address: umi.identity.publicKey.toString(),
                  share: 100,
                },
              ],
            },
          }
        : {}),
      ...(jsonMetadata.extensions ? { extensions: jsonMetadata.extensions } : {}),
    }
    const metadataJsonFile = createGenericFileFromJson(
      newJsonMetadata,
      `${id}.json`,
      existingMetadata
        ? {
            tags: [
              {
                name: 'Root-TX',
                value: getUriTransactionId(existingMetadata.uri),
              },
            ],
          }
        : {}
    )

    const [metadataUri] = await uploader.upload([metadataJsonFile])

    mutableMetadataUri = getMutableUploadedFileUri(metadataUri)

    console.log(`Metadata uploaded to ${mutableMetadataUri}`.cyan)
  }

  return mutableMetadataUri
}
