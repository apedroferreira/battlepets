import { GoogleAnalytics } from '@next/third-parties/google'
import { BASE_URL } from 'battlepets-shared/constants'
import { Sora } from 'next/font/google'

import { GA_ID } from '@/common/constants'

import type { Metadata, Viewport } from 'next'

import './globals.scss'

const sora = Sora({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Battlepets',
  description: 'Collect pets, battle and earn in a deck-builder, auto-battler mobile game!',
  openGraph: {
    title: 'Battlepets',
    description: 'Collect pets, battle and earn in a deck-builder, auto-battler mobile game!',
    url: BASE_URL,
    siteName: 'Battlepets',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#7a00b8',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7a00b8" />

        <link rel="stylesheet" href="https://use.typekit.net/bjy5uxp.css" />
      </head>

      <body className={sora.className}>{children}</body>

      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  )
}

export default RootLayout
