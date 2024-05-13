import fs from 'fs/promises'
import path from 'path'

import { minify } from 'html-minifier'
import mjml2html from 'mjml'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { EMAILS } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'

const convertEmailsToHtml = async () => {
  await Promise.all(
    Object.keys(EMAILS).map(async emailId => {
      const emailMjmlFilePath = path.resolve(__dirname, `./emails/input/${emailId}.mjml`)
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const emailMjml = await fs.readFile(emailMjmlFilePath, 'utf8')

      const htmlEmail = mjml2html(emailMjml, {
        validationLevel: 'strict',
      })
      const minifiedEmailHtml = minify(htmlEmail.html, {
        collapseWhitespace: true,
        minifyCSS: false,
        removeEmptyAttributes: true,
      })

      const emailHtmlFilePath = path.resolve(__dirname, `./emails/output/${emailId}.html`)
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(emailHtmlFilePath, minifiedEmailHtml)

      console.log(`HTML email "${emailId}" saved at ${path.relative(__dirname, emailHtmlFilePath)}.`.cyan)
    })
  )

  console.log('All emails converted to HTML!'.green)
}

executeScript(convertEmailsToHtml)
