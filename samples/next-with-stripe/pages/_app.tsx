import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import { type AppProps } from 'next/app'
import StripeCartProvider from '../components/StripeCartProvider'
import { config } from '../stanzaConfig'

import '../styles.css'

let loadPromise: Promise<any> = Promise.resolve()
if (process.env.NODE_ENV === 'development') {
  const mswMock = import('../msw/mock')
  loadPromise = mswMock.then(async module => module.initMocks())
}

const stanzaInstance = createStanzaInstance({ ...config, pollDelay: loadPromise })

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <StanzaProvider instance={stanzaInstance}>
      <StripeCartProvider>
        <Component {...pageProps} />
      </StripeCartProvider>
    </StanzaProvider>
  )
}

export default MyApp
