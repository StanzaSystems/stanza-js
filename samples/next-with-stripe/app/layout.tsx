import { WithStanzaContextName } from '@getstanza/react'
import WithStanza from '../components/WithStanza'
import StripeCartProvider from '../components/StripeCartProvider'
import Layout from '../components/Layout'

import '../styles.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <WithStanza>
          <WithStanzaContextName name='main'>
            <StripeCartProvider>
              <Layout title='Stanza Toy Store'>
                <div className='page-container'>{children}</div>
              </Layout>
            </StripeCartProvider>
          </WithStanzaContextName>
        </WithStanza>
      </body>
    </html>
  )
}
