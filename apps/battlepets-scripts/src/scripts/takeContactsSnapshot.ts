import fs from 'fs/promises'
import path from 'path'

import { neon } from '@neondatabase/serverless'
import { stringify as csvStringify } from 'csv-stringify'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

// eslint-disable-next-line import/order
import { executeScript } from '@/utils/scriptUtils'

const getContactsSnapshotFilePath = (id?: string) =>
  path.resolve(__dirname, `./scriptsData/output/${Date.now()}_emails${id ? `_${id}` : ''}.csv`)

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string' },
})

const takeContactsSnapshot = async () => {
  const { id } = await argv.parse()

  if (!process.env.DATABASE_URL) {
    throw new Error('Must set database URL!')
  }

  const sql = neon(process.env.DATABASE_URL)

  const contacts = (await sql`SELECT email FROM mailing_list_contacts`) as { email: string }[]

  const contactsCsv = csvStringify(contacts, {
    columns: ['email'],
    header: true,
  })

  const contactsSnapshotFilePath = getContactsSnapshotFilePath(id)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(contactsSnapshotFilePath, contactsCsv)

  console.log(`Contacts snapshot taken and saved at ${path.relative(__dirname, contactsSnapshotFilePath)}!`.green)
}

executeScript(takeContactsSnapshot)
