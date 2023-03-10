import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import { config } from '../stanzaConfig'
import { type AppProps } from 'next/app'

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
    <Component {...pageProps} />
  </StanzaProvider>
  )
}

export default MyApp
