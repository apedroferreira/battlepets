import fs from 'fs/promises'
import path from 'path'

import { DOMAIN } from 'battlepets-shared/constants'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import { stringify as csvStringify } from 'csv-stringify'
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

import type { MessageSendingResponse } from 'postmark/dist/client/models'

const SENDER_EMAIL = `team@mail.${DOMAIN}`

type Contacts = {
  email: string
  status: 'pending' | 'sent' | 'failed'
}[]

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(EMAILS), demandOption: true },
  fileName: { type: 'string', demandOption: true },
  retryFailedEmails: { type: 'boolean' },
})

const sendEmail = async () => {
  const { fileName, id, retryFailedEmails = false } = await argv.parse()

  if (!process.env.POSTMARK_SERVER_API_TOKEN) {
    throw new Error('Must set Postmark Server API token!')
  }

  const postmarkClient = new PostmarkServerClient(process.env.POSTMARK_SERVER_API_TOKEN)

  const contactsFilePath = path.resolve(__dirname, `../scripts/scriptsData/input/${fileName}.csv`)
  const contacts = (await csvToJson().fromFile(contactsFilePath)) as Contacts

  const eligibleContacts = contacts
    .map(contact => {
      const { email, status } = contact

      if (!email) {
        throw new Error('Missing contact email!')
      }
      if (!status) {
        throw new Error('Missing contact status!')
      }

      return contact
    })
    .filter(({ status }) => status === 'pending' || (retryFailedEmails && status === 'failed'))

  const emailHtmlFilePath = path.resolve(__dirname, `../scripts/emails/output/${id}.html`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const emailHtml = await fs.readFile(emailHtmlFilePath, 'utf8')

  const emailTextFilePath = path.resolve(__dirname, `../scripts/emails/text/${id}.txt`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const emailText = await fs.readFile(emailTextFilePath, 'utf8')

  const emailData = EMAILS[id as Email]

  const sendEmailResults = await Promise.allSettled(
    eligibleContacts.map(async ({ email }) => ({
      result: await postmarkClient.sendEmail({
        From: SENDER_EMAIL,
        To: email,
        Subject: emailData.subject,
        HtmlBody: emailHtml,
        TextBody: emailText,
        MessageStream: 'broadcast',
        Tag: emailData.tag,
      }),
      email,
    }))
  )

  const successfulEmails = sendEmailResults
    .filter(result => result.status === 'fulfilled')
    .map(
      result =>
        (
          result as PromiseFulfilledResult<{
            result: MessageSendingResponse
            email: string
          }>
        ).value
    )

  const failedEmailReasons = sendEmailResults
    .filter(result => result.status === 'rejected')
    .map(result => (result as PromiseRejectedResult).reason as string)

  const successfulEmailAddresses = successfulEmails.map(({ email }) => email)

  const updatedContacts = contacts.map(contact => {
    const { email, status } = contact

    if (!email) {
      throw new Error('Missing contact email!')
    }
    if (!status) {
      throw new Error('Missing contact status!')
    }

    if (status === 'pending' || status === 'failed') {
      return {
        email,
        status: successfulEmailAddresses.includes(email) ? 'sent' : 'failed',
      }
    }

    return contact
  })

  const updatedContactsCsv = csvStringify(updatedContacts, {
    columns: ['email', 'status'],
    header: true,
  })

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(contactsFilePath, updatedContactsCsv)

  const emailCount = sendEmailResults.length
  const successfulEmailCount = successfulEmails.length
  const failedEmailCount = emailCount - successfulEmailCount

  if (emailCount > 0) {
    console.log(`Email "${id}" sent to ${pluralize(emailCount, 'contact')}!`.cyan)
  } else {
    console.log('No emails to send!'.cyan)
  }

  if (successfulEmailCount > 0) {
    console.log(`${pluralize(successfulEmailCount, 'email')} successful.`.green)
  }
  if (failedEmailCount > 0) {
    console.log(`${pluralize(failedEmailCount, 'email')} failed.`.red)
    console.error(`${failedEmailReasons[0]}`.red)
  }
}

executeScript(sendEmail)
