import { WithStanzaContextName } from '@getstanza/react'
import WithStanza from './withStanza'

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body>
    <WithStanza>
      <WithStanzaContextName name="main">
        { children }
      </WithStanzaContextName>
    </WithStanza>
    </body>
    </html>
  )
}
