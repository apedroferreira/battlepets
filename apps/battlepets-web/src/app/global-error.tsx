'use client'

import * as Sentry from '@sentry/nextjs'
import { Sora } from 'next/font/google'
import Link from 'next/link'
import { useEffect } from 'react'

import globalStyles from '@/common/global.module.scss'
import { Button } from '@/components/Button'

import './globals.scss'

const sora = Sora({ subsets: ['latin'] })

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = ({ error }: GlobalErrorProps) => {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/bjy5uxp.css" />
      </head>
      <body className={sora.className}>
        <div className={globalStyles.genericPage}>
          <h3>Something Went Wrong</h3>
          <p>There was an unexpected error…</p>
          <Link href="/">
            <Button>Go To Home Page</Button>
          </Link>
        </div>
      </body>
    </html>
  )
}

export default GlobalError
