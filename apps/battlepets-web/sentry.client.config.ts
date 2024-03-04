// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { IS_PROD_ENV, SENTRY_DSN, SENTRY_ENVIRONMENT } from '@/common/constants'

Sentry.init({
  enabled: IS_PROD_ENV,
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  environment: SENTRY_ENVIRONMENT,
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    // eslint-disable-next-line import/namespace
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
