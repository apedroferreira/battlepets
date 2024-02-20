import { Sora } from 'next/font/google'

import type { Metadata } from 'next'

import './globals.scss'

const sora = Sora({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Battlepets',
  description: 'Collect pets, battle and earn in this deck builder, auto battler mobile game!',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/bjy5uxp.css" />
      </head>
      <body className={sora.className}>{children}</body>
    </html>
  )
}

export default RootLayout
