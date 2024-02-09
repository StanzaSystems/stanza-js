## Stanza Cloudflare Proxy (POC)

This is a sample application that uses `@getstanza/sdk-cloudflare` to proxy requests to https://zenquotes.io.
It is configured to use `CloudflareProxy` service and `ZenQuoteProxy` guard. Make sure that you have those configured in Stanza UI.

The Cloudflare Worker app uses a couple of variables that need to be set:

- `STANZA_API_KEY`
- `STANZA_HUB_ADDRESS`
- `STANZA_ENVIRONMENT`

To work locally you can use the example `.dev.vars.example` file and copy it to `.dev.vars`:

```shell
cp .dev.vars.example .dev.vars
```

Obtain (or create) an API key from your Stanza UI administration panel and set `STANZA_API_KEY` in your `.dev.vars` file to use it for local development. To use it on a deployed Worker you will need to set (and encrypt) it in your [Cloudflare Dashboard](https://dash.cloudflare.com)'s Workers & Pages section

For your deployed application you can set appropriate values for `STANZA_HUB_ADDRESS` and `STANZA_ENVIRONMENT` in the [wrangler.toml](./wrangler.toml) file

### Important notes

Right now the deployed Cloudflare Worker cannot fetch from an endpoint with a custom port specified ie. `https://your-hub-url.com:1234`. In order to make it work you will need to create a tunnel/proxy pointing to a needed URL (for Hub and metrics) and set up the URLs properly:

- you can set Hub url via the [wrangler.toml](./wrangler.toml) file
- you need set metrics/traces url in Hub's DB at the moment

For local development you can use [Cloudflare tunnel](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/#start-a-cloudflare-tunnel) to point ot your local Hub and OTel instances
