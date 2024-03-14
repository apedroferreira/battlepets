import * as Sentry from '@sentry/react'

import { SENTRY_DSN, SENTRY_ENVIRONMENT } from '@/common/constants'

export const initializeSentry = (): void => {
  Sentry.init({
    enabled: import.meta.env.PROD,
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/battlepets\.io/],
    replaysSessionSampleRate: 0.1,
    environment: SENTRY_ENVIRONMENT,
  })
}
