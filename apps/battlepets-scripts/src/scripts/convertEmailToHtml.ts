import fs from 'fs/promises'
import path from 'path'

import { minify } from 'html-minifier'
import mjml2html from 'mjml'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { EMAILS } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(EMAILS), demandOption: true },
})

const convertEmailToHtml = async () => {
  const { id } = await argv.parse()

  const emailMjmlFilePath = path.resolve(__dirname, `./emails/input/${id}.mjml`)
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

  const emailHtmlFilePath = path.resolve(__dirname, `./emails/output/${id}.html`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(emailHtmlFilePath, minifiedEmailHtml)

  console.log(`HTML email saved at ${path.relative(__dirname, emailHtmlFilePath)}!`.green)
}

executeScript(convertEmailToHtml)
