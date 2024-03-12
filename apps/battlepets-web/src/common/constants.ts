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
