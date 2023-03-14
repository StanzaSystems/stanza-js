import { ActionCode } from '@getstanza/browser'
import { useStanzaContext } from '@getstanza/react'
import { type NextPage } from 'next'
import CartButton from '../components/CartButton'
import Layout from '../components/Layout'
import Products from '../components/Products'

const MainPage: NextPage = () => {
  const stanzaContext = useStanzaContext('main')

  return (
    <Layout title="Stanza Swag Shop">
      <div className="page-container">
          <CartButton />
          <form style={{ display: 'flex' }}>
            <input style={{ flexBasis: '75%' }} type='text' id='searchProducts' placeholder={stanzaContext?.features.search.message}></input>
          <button style={{ flexBasis: '25%' }}>Search</button>
          </form>
          {stanzaContext?.features.featured.code !== ActionCode.DISABLED_REMOVE.valueOf() && (
            <>
            <h2>Cool New Swag!</h2>
            <Products />
            </>
          ) }
          {stanzaContext?.features.featured.message}
      </div>
    </Layout>
  )
}

export default MainPage
