export const env = {
  // NEXT_PUBLIC_STANZA_HUB_ADDRESS: 'http://192.168.0.102:9010',
  NEXT_PUBLIC_STANZA_HUB_ADDRESS: 'http://127.0.0.1:9010',
  NEXT_PUBLIC_STANZA_ENVIRONMENT: 'local',
  NEXT_PUBLIC_STANZA_BROWSER_KEY: 'valid-api-key',
  NEXT_PUBLIC_STANZA_API_KEY:
    '811f2e7ef99d3de895710a06d61f69af220f8c3e597d2cc113ed9d67ea994e9b',

  //   #NEXT_PUBLIC_STANZA_LOG_LEVEL:debug,
  //   #STANZA_LOG_LEVEL:debug,
  // # uncomment if you need Stanza debugging output

  // # Stripe Configuration
  // # https://dashboard.stripe.com/apikeys
  //   #NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:pk_test_51MjV6LE3MY86wIEkCzNR5mow1utPJrgv08fWYKVWcmyoPj2kuLr93a2I87nAYcKHJu6IhAiGy8FxO8K3pQTRk81s00UmKb0sxs,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    'pk_test_51O880ABQzP6kIgYW1kOiATrRoxunmYxFc2wZLAXwoBJ5GWmgmw80kMsyEuPUHOKQ57das0JvGTZU5tEz7lsIGO0u00UyFuGCYT',
  // #STRIPE_SECRET_KEY:sk_test_51MjV6LE3MY86wIEkdPY3dpNBqKz4VHYxuM38DqtdBLPlbdlocZWEPTc54Xm1zJS21JQmlr4MrgIxQoAkAJqc4GWc00oNNKWsmJ,
  STRIPE_SECRET_KEY:
    'sk_test_51O880ABQzP6kIgYWfP2eNdhBxJLPOY4x6iAZiLmbwuM57iq1kH4BqVC4ExZlntgeW6HpgaV8bbGnDndWKsYOQaQH00KNYMfFxu',
  STRIPE_PAYMENT_DESCRIPTION: 'Cool robot swag',
  // # https://stripe.com/docs/webhooks/signatures
  STRIPE_WEBHOOK_SECRET: 'whsec_1234',
  STANZA_LOG_LEVEL: 'debug',
};
