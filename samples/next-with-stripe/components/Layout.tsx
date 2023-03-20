import React, { type ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import CartButton from './CartButton'

interface Props {
  children: ReactNode
  title?: string
}

const Layout = ({
  children,
  title = 'Stanza Fruit Stand'
}: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@stanzasystems" />
      <meta name="twitter:title" content="Stanza Fruit Stand" />
      <meta
        name="twitter:description"
        content="Stanza Fruit Stand: Robust demo for stanza.systems"
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
            <span className="light">{title}</span>
          </h1>
          <CartButton/>
        </div>
      </header>
      <>{children}</>
    </div>
    <div className='container'>
      <iframe className='statsWindow' src='https://loadtest.dev.getstanza.dev/'></iframe>
    </div>
  </>
)

export default Layout
