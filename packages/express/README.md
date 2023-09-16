# Stanza Express

This package exposes an express middleware function for Stanza guards, and an error handler that converts stanza errors to 429s.

## Usage

```
import { expressStanzaGuard, stanzaErrorHandler } from '@getstanza/express'
app.use(expressStanzaGuard({ guard: 'root_service_guard' }))


/// after all routes and before other error handlers
app.use(stanzaErrorHandler)
```


See further usage in `samples/express-demo`.



## Building

Run `nx build express` to build the library.





## Running unit tests

Run `nx test express` to execute the unit tests via [Jest](https://jestjs.io).


