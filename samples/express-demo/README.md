## Express demo app

An extremely simple demo app that illustrates how Stanza can be used to rate limit a service's incoming requests.

## To run load test
```
npx artillery quick --count 20 --num 10 http://localhost:3002/ping
```