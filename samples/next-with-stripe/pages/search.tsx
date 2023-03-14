import { useRouter } from 'next/router'
import Products from '../components/Products'
import products from '../data/products'

const SearchPage = () => {
  const router = useRouter()
  const searchString = router.query.text?.toString() ?? ''
  return (<>
    <div>Search: {searchString}</div>
    <Products products={products.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()))}/>
  </>)
}

export default SearchPage
