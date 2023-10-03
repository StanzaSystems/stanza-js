import { WithStanzaContextName } from '@getstanza/react'
import WithStanza from './withStanza'
import { initStanza } from '@getstanza/react-next'
import { config } from '../stanzaConfig'

initStanza(config)

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body>
     <WithStanza>
    {/* <StanzaProvider instance={ stanzaInstance }> */}
      <WithStanzaContextName name="main">
        { children }
      </WithStanzaContextName>
    {/* </StanzaProvider> */}
     </WithStanza>
    </body>
    </html>
  )
}
