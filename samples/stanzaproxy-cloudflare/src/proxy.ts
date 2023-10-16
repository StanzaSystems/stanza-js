interface GetTokenResponse extends Promise<unknown>{
	granted: boolean;
	token: string;
	reason: string
}


export default {
	async guard(proxyUrl: URL, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const key = request.headers.get('X-Stanza-Key')

		// check for X-Stanza-Key header
		if (key === null) {
			return new Response("407 Proxy Authentication Required", {status: 407, statusText: "Proxy Authentication Required"})
		}

		// make a hard-coded and very simple stanza quota request
		let getTokenRequestHeaders = new Headers()
		getTokenRequestHeaders.set('X-Stanza-Key', key)
		let getTokenRequestPayload = "{\"selector\":{\"environment\":\"dev\",\"guardName\":\"StressTest\",\"featureName\":\"\"}}"
		let getTokenRequest = new Request(
			"https://hub.stanzasys.co/v1/quota/token",
			{method: "POST", headers: getTokenRequestHeaders, body: getTokenRequestPayload},
		)
		let getTokenResponse = await fetch(getTokenRequest)

		// catch all non-success cases for now
		if (!getTokenResponse.ok) {
			return getTokenResponse
		}

		// decode getTokenResponse
		let getTokenResponseJSON: GetTokenResponse = JSON.parse(await getTokenResponse.text())

		// return a 429 if we didn't get a token
		if (!getTokenResponseJSON.granted) {
			return new Response("429 Too Many Requests", {status: 429, statusText: "Too Many Requests"})
		}
		
		// carry through request path and query string
		proxyUrl.pathname = url.pathname
		proxyUrl.search = url.search

		// carry through original request headers (except for X-Stanza-Key)
		let proxyHeaders = new Headers(request.headers)
		proxyHeaders.delete('X-Stanza-Key')
		proxyHeaders.set('X-Stanza-Token', getTokenResponseJSON.token)
		let proxyRequest = new Request(request, {headers: proxyHeaders})

		// make subrequests with the global `fetch()` function
		let res = await fetch(proxyUrl, proxyRequest);
		return res;
	},
};
