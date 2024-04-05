import fs from 'fs/promises'
import path from 'path'

import { DOMAIN } from 'battlepets-shared/constants'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import csvToJson from 'csvtojson'
import { ServerClient as PostmarkServerClient } from 'postmark'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { EMAILS } from '@/common/constants'
import { Email } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'

const SENDER_EMAIL = `team@mail.${DOMAIN}`

type Contacts = {
  email: string
}[]

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(EMAILS), demandOption: true },
  fileName: { type: 'string', demandOption: true },
})

const sendEmail = async () => {
  const { fileName, id } = await argv.parse()

  if (!process.env.POSTMARK_SERVER_API_TOKEN) {
    throw new Error('Must set Postmark Server API token!')
  }

  const postmarkClient = new PostmarkServerClient(process.env.POSTMARK_SERVER_API_TOKEN)

  const contactsFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${fileName}.csv`)
  const contacts = (await csvToJson().fromFile(contactsFilePath)) as Contacts

  const emailHtmlFilePath = path.resolve(__dirname, `../scripts/emails/output/${id}.html`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const emailHtml = await fs.readFile(emailHtmlFilePath, 'utf8')

  const emailTextFilePath = path.resolve(__dirname, `../scripts/emails/text/${id}.txt`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const emailText = await fs.readFile(emailTextFilePath, 'utf8')

  const emailData = EMAILS[id as Email]

  await postmarkClient.sendEmail({
    From: SENDER_EMAIL,
    To: contacts.map(({ email }) => email).join(','),
    Subject: emailData.subject,
    HtmlBody: emailHtml,
    TextBody: emailText,
    MessageStream: 'broadcast',
    Tag: emailData.tag,
  })

  console.log(`Email "${id}" sent to ${pluralize(contacts.length, 'contact')}!`.green)
}

executeScript(sendEmail)
