import { Elements } from '@stripe/react-stripe-js'
import ElementsForm from '../components/ElementsForm'
import getStripe from '../utils/get-stripejs'
import type { GetServerSideProps } from 'next'

interface CheckoutProps {
  clientSecret: string
}

const stripe = getStripe()

const Checkout = (props: CheckoutProps) => {
  return (
    <Elements options={{ clientSecret: props.clientSecret }} stripe={stripe}>
      <ElementsForm />
    </Elements>
  )
}

export const getServerSideProps: GetServerSideProps<CheckoutProps> = async (
  context
) => {
  let result
  const host = context.req.headers.host ?? 'localhost:4200'
  try {
    const response = await fetch(`http://${host}/api/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1400
      })
    })
    result = await response.json()
  } catch (error) {
    console.log(error)
  }

  return {
    props: {
      clientSecret: result?.client_secret ?? ''
    }
  }
}

export default Checkout
