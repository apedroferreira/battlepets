// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { IS_PROD_ENV, SENTRY_DSN, SENTRY_ENVIRONMENT } from '@/common/constants'

Sentry.init({
  enabled: IS_PROD_ENV,
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: SENTRY_ENVIRONMENT,
})
