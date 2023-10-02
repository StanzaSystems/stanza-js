import { WithStanzaContextName } from '@getstanza/react-next'
import Foo from './foo'

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body>
    <Foo>
    {/* <StanzaProvider instance={ stanzaInstance }> */}
      <WithStanzaContextName name="main">
        { children }
      </WithStanzaContextName>
    {/* </StanzaProvider> */}
    </Foo>
    </body>
    </html>
  )
}
