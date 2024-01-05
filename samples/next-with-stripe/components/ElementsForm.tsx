import React, { useState, type FC } from 'react';

import CustomDonationInput from '../components/CustomDonationInput';
import StripeTestCards from '../components/StripeTestCards';
import PrintObject from '../components/PrintObject';

import { fetchPostJSON } from '../utils/api-helpers';
import {
  formatAmountForDisplay,
  formatAmountFromStripe,
} from '../utils/stripe-helpers';
import * as config from '../config';

import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { type PaymentIntent } from '@stripe/stripe-js';
import { getPaymentStatus } from '../utils/get-payment-status';

interface PaymentStatusProps {
  status: string;
  errorMessage: string | null;
}

const PaymentStatus = (props: PaymentStatusProps) => {
  const { status, errorMessage } = props;
  const message = getPaymentStatus(status, errorMessage);
  if (message === null) {
    return null;
  }

  if (errorMessage === null) {
    return <h2>{message}</h2>;
  }

  return (
    <>
      <h2>Error 😭</h2>
      <p className='error-message'>{errorMessage}</p>
    </>
  );
};

const ElementsForm: FC<{
  paymentIntent?: PaymentIntent | null;
}> = ({ paymentIntent = null }) => {
  const defaultAmount =
    paymentIntent != null
      ? formatAmountFromStripe(paymentIntent.amount, paymentIntent.currency)
      : Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP);
  const [input, setInput] = useState({
    customDonation: defaultAmount,
    cardholderName: '',
  });
  const [paymentType, setPaymentType] = useState('');
  const [payment, setPayment] = useState({ status: 'initial' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Abort if form isn't valid
    if (!e.currentTarget.reportValidity()) return;
    if (elements == null) return;
    setPayment({ status: 'processing' });

    // Create a PaymentIntent with the specified amount.
    const response = await fetchPostJSON('/api/payment_intents', {
      amount: input.customDonation,
      payment_intent_id: paymentIntent?.id,
    });
    setPayment(response);

    if (response.statusCode === 500) {
      setPayment({ status: 'error' });
      setErrorMessage(response.message);
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const error = await stripe?.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
        payment_method_data: {
          billing_details: {
            name: input.cardholderName,
          },
        },
      },
    });

    if (error !== undefined) {
      setPayment({ status: 'error' });
      setErrorMessage(error?.error.message ?? 'An unknown error occurred');
    } else if (paymentIntent != null) {
      setPayment(paymentIntent);
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    submit(e).catch(() => {});
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CustomDonationInput
          className='elements-style'
          name='customDonation'
          value={input.customDonation}
          min={config.MIN_AMOUNT}
          max={config.MAX_AMOUNT}
          step={config.AMOUNT_STEP}
          currency={config.CURRENCY}
          onChange={handleInputChange}
        />
        <StripeTestCards />
        <fieldset className='elements-style'>
          <legend>Your payment details:</legend>
          {paymentType === 'card' ? (
            <input
              placeholder='Cardholder name'
              className='elements-style'
              type='Text'
              name='cardholderName'
              onChange={handleInputChange}
              required
            />
          ) : null}
          <div className='FormRow elements-style'>
            <PaymentElement
              onChange={(e) => {
                setPaymentType(e.value.type);
              }}
            />
          </div>
        </fieldset>
        <button
          className='elements-style-background'
          type='submit'
          disabled={
            !['initial', 'succeeded', 'error'].includes(payment.status) ||
            stripe == null
          }
        >
          Donate {formatAmountForDisplay(input.customDonation, config.CURRENCY)}
        </button>
      </form>
      <PaymentStatus
        status={payment.status}
        errorMessage={errorMessage}
      />
      <PrintObject content={payment} />
    </>
  );
};

export default ElementsForm;
