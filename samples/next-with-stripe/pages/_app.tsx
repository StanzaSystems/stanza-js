import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import { type AppProps } from 'next/app'
import React from 'react'
import Layout from '../components/Layout'
import StripeCartProvider from '../components/StripeCartProvider'
import { config } from '../stanzaConfig'

import '../styles.css'

let loadPromise: Promise<any> = Promise.resolve()
if (process.env.NODE_ENV === 'development') {
  // const mswMock = import('../msw/mock')
  // loadPromise = mswMock.then(async module => module.initMocks())
  loadPromise = Promise.resolve()
}

const stanzaInstance = createStanzaInstance({ ...config, pollDelay: loadPromise })

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <StanzaProvider instance={stanzaInstance}>
      <StripeCartProvider>
        <Layout title="Stanza Fruit Stand">
          <div className="page-container">
            <Component {...pageProps} />
          </div>
        </Layout>
      </StripeCartProvider>
    </StanzaProvider>
  )
}

export default MyApp
