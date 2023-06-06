## Express demo app

An extremely simple demo app that illustrates how Stanza can be used to rate limit a service's incoming requests.

To run, first copy the sample environment variables into a local .env.

In the [Stanza UI](), create a decorator:

```
npm install
npm run dev
```

## To run load test
```
npx artillery run ./load-test.yml
```