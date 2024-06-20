import { PRESALE_URL } from 'battlepets-shared/constants'
import Link from 'next/link'

export const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

// Node environment variables

export const DEV_ENV = 'development'
export const TEST_ENV = 'test'
export const PROD_ENV = 'production'

export const NODE_ENV = process.env.NODE_ENV || DEV_ENV

// Environment helpers

export const IS_DEV_ENV = NODE_ENV === DEV_ENV
export const IS_TEST_ENV = NODE_ENV === TEST_ENV
export const IS_PROD_ENV = NODE_ENV === PROD_ENV

// Environment variables

export const IS_STAGING = Boolean(process.env.NEXT_PUBLIC_IS_STAGING === 'true')

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
export const SENTRY_ENVIRONMENT = IS_STAGING ? 'staging' : NODE_ENV

// Presentational

export const BANNER_CONTENT = (
  <>
    Don’t miss the{' '}
    <Link href={PRESALE_URL} rel="noopener noreferrer nofollow">
      BPETS Token Presale
    </Link>{' '}
    on{' '}
    <Link href={PRESALE_URL} rel="noopener noreferrer nofollow">
      PinkSale
    </Link>
    , starting on <strong>Saturday, June 22, 5 PM UTC</strong>!
  </>
)
