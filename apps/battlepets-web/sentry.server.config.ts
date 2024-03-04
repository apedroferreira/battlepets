// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { IS_PROD_ENV, SENTRY_DSN, SENTRY_ENVIRONMENT } from '@/common/constants'

Sentry.init({
  enabled: IS_PROD_ENV,
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: SENTRY_ENVIRONMENT,
})
