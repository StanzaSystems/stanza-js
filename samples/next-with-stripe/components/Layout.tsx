import React, { type ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  children: ReactNode
  title?: string
}

const Layout = ({
  children,
  title = 'Stanza Swag Shop'
}: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@thorwebdev" />
      <meta name="twitter:title" content="Stanza Swag Shop" />
      <meta
        name="twitter:description"
        content="Stanza Swag Shop: Robust demo for stanza.systems"
      />
      <meta
        name="twitter:image"
        content="https://nextjs-typescript-react-stripe-js.vercel.app/social_card.png"
      />
    </Head>
    <div className="container">
      <header>
        <div className="header-content">
          <Link href="/" className="logo">
            <Image src="/logo.png" width={150} height={50} alt="Stanza logo" />
          </Link>
          <h1>
            <span className="light">Stanza Swag Shop</span>
          </h1>
        </div>
      </header>
      <>{children}</>
    </div>
  </>
)

export default Layout
