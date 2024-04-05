import fsSync from 'fs'
import fs from 'fs/promises'
import path from 'path'
import readline from 'readline/promises'

import { stringify as csvStringify } from 'csv-stringify'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

// eslint-disable-next-line import/order
import { executeScript } from '@/utils/scriptUtils'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const getTelegramGroupSnapshotFilePath = (id?: string) =>
  path.resolve(__dirname, `./scriptsData/output/${Date.now()}_telegram${id ? `_${id}` : ''}.csv`)

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string' },
})

const takeTelegramGroupSnapshot = async () => {
  const { id } = await argv.parse()

  if (!process.env.TELEGRAM_APP_API_ID) {
    throw new Error('Must set Telegram app API id!')
  }
  if (!process.env.TELEGRAM_APP_API_HASH) {
    throw new Error('Must set Telegram app API hash!')
  }
  if (!process.env.TELEGRAM_GROUP_ID) {
    throw new Error('Must set Telegram group id!')
  }

  const telegramSessionFilePath = path.resolve(__dirname, './scriptsData/sessions/telegram.txt')

  let currentSession = ''
  if (fsSync.existsSync(telegramSessionFilePath)) {
    currentSession = await fs.readFile(telegramSessionFilePath, 'utf8')
  }

  const telegramClient = new TelegramClient(
    new StringSession(currentSession),
    Number(process.env.TELEGRAM_APP_API_ID),
    process.env.TELEGRAM_APP_API_HASH,
    {
      connectionRetries: 5,
    }
  )

  await telegramClient.start({
    phoneNumber: () => rl.question('Please enter your phone number: '),
    password: () => rl.question('Please enter your password: '),
    phoneCode: () => rl.question('Please enter the code you received: '),
    onError: error => {
      throw error
    },
  })

  if (!currentSession) {
    const sessionString = telegramClient.session.save() as unknown as string
    await fs.writeFile(telegramSessionFilePath, sessionString)
  }

  const groupMembers = (await telegramClient.getParticipants(parseInt(process.env.TELEGRAM_GROUP_ID), {})).map(
    user => ({
      id: user.id.valueOf(),
      username: user.username,
    })
  )

  const telegramGroupCsv = csvStringify(groupMembers, {
    columns: ['id', 'username'],
    header: true,
  })

  const telegramGroupSnapshotFilePath = getTelegramGroupSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(telegramGroupSnapshotFilePath, telegramGroupCsv)

  console.log(
    `Telegram group snapshot taken and saved at ${path.relative(__dirname, telegramGroupSnapshotFilePath)}!`.green
  )

  await telegramClient.disconnect()
  process.exit(0)
}

executeScript(takeTelegramGroupSnapshot)
