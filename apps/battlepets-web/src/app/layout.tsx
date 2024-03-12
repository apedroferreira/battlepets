import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { BASE_URL } from 'battlepets-shared/constants'
import { Sora } from 'next/font/google'

import { GA_ID } from '@/common/constants'

import type { Metadata, Viewport } from 'next'

import './globals.scss'

const sora = Sora({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Battlepets',
  description:
    'Collect pet NFTs, battle and win rewards in a deck-builder, auto-battler mobile game on the blockchain!',
  openGraph: {
    title: 'Battlepets',
    description:
      'Collect pet NFTs, battle and win rewards in a deck-builder, auto-battler mobile game on the blockchain!',
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

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />

      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7a00b8" />

      <link rel="stylesheet" href="https://use.typekit.net/bjy5uxp.css" />
    </head>

    <body className={sora.className}>{children}</body>

    <Analytics />
    <SpeedInsights />
    {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
  </html>
)

export default RootLayout
