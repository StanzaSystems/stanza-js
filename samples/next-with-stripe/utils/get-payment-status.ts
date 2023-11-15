function getPaymentStatus(
  status: string,
  errorMessage: string | null | undefined = 'Try again later'
) {
  switch (status) {
    case 'processing':
    case 'requires_payment_method':
    case 'requires_confirmation':
      return 'Processing...';

    case 'requires_action':
      return 'Authenticating...';

    case 'succeeded':
      return 'Payment Succeeded 🥳';

    case 'error':
      return errorMessage;

    default:
      return null;
  }
}

export { getPaymentStatus };
