import { type NextPage } from 'next'
import { useStanzaContext } from '@getstanza/react'
import Layout from '../components/Layout'

import Cart from '../components/Cart'
import CartSummary from '../components/CartSummary'
import Products from '../components/Products'

const MainPage: NextPage = () => {
  const stanzaContext = useStanzaContext('main')

  return (
    <Layout title="Stanza Swag Shop">
      <div className="page-container">
        <Cart>
          <CartSummary />
          <form style={{ display: 'flex' }}>
            <input style={{ flexBasis: '75%' }} type='text' id='searchProducts' placeholder={stanzaContext?.features.search.message}></input>
          <button style={{ flexBasis: '25%' }}>Search</button>
        </form>
          {}
          <h2>Cool New Swag!</h2>
          <Products />
        </Cart>
      </div>
    </Layout>
  )
}

export default MainPage
