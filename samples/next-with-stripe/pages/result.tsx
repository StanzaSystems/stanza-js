import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import ClearCart from '../components/ClearCart'

import Layout from '../components/Layout'
import PrintObject from '../components/PrintObject'

import { fetchGetJSON } from '../utils/api-helpers'

const ResultPage: NextPage = () => {
  const router = useRouter()

  // Fetch CheckoutSession from static page via
  // https://nextjs.org/docs/basic-features/data-fetching#static-generation
  const { data, error } = useSWR(
    router?.query?.session_id !== undefined
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      ? `/api/checkout_sessions/${router.query.session_id}`
      : null,
    fetchGetJSON
  )

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (error) return <div>failed to load</div>

  return (
    <div className="page-container">
      <h1>Checkout Payment Result</h1>
      <h2>Status: {data?.payment_intent?.status ?? 'loading...'}</h2>
      <h3>CheckoutSession response:</h3>
      <PrintObject content={data ?? 'loading...'} />
      <ClearCart />
    </div>
  )
}

export default ResultPage
