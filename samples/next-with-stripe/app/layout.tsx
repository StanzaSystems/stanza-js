import { config } from '../stanzaConfig'
import { createStanzaInstance } from '@getstanza/react'
import { StanzaProvider, WithStanzaContextName } from '@getstanza/react-next'

const stanzaInstance = createStanzaInstance({
  ...config
  // pollDelay: loadPromise
})

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body>
    <StanzaProvider instance={ stanzaInstance }>
      <WithStanzaContextName name="main">
        { children }
      </WithStanzaContextName>
    </StanzaProvider>
    </body>
    </html>
  )
}
