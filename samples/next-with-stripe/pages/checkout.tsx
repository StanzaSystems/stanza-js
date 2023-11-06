import { Elements } from '@stripe/react-stripe-js'
import ElementsForm from '../components/ElementsForm'
import getStripe from '../utils/get-stripejs'
import type { GetServerSideProps } from 'next'

interface CheckoutProps {
  clientSecret: string
}

const stripe = getStripe()

const Checkout = (props: CheckoutProps) => {
  console.log(props)
  return (
    <Elements options={{ clientSecret: props.clientSecret }} stripe={stripe}>
      <ElementsForm/>
    </Elements>
  )
}

export const getServerSideProps: GetServerSideProps<CheckoutProps> = async () => {
  let result
  try {
    const response = await fetch('http://localhost:4200/api/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1400
      })
    })
    result = await response.json()
    console.log(result.client_secret)
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
