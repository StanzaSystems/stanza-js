import { WithStanzaContextName } from '@getstanza/react'
import { type AppProps } from 'next/app'
import React from 'react'
import Layout from '../components/Layout'
import StripeCartProvider from '../components/StripeCartProvider'

import '../styles.css'
import WithStanza from '../components/WithStanza'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WithStanza>
      <WithStanzaContextName name='main'>
        <StripeCartProvider>
          <Layout title='Stanza Toy Store'>
            <div className='page-container'>
              <Component {...pageProps} />
            </div>
          </Layout>
        </StripeCartProvider>
      </WithStanzaContextName>
    </WithStanza>
  )
}

export default MyApp
