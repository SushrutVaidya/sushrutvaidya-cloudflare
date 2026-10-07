/**
 * Host-based shell selection for Cloudflare Pages.
 *
 * One Pages project serves both hosts off one build:
 *   - sushrutvaidya.in            → the full portfolio (index.html)
 *   - loglens.sushrutvaidya.in    → the standalone loglens product page
 *                                   (loglens.html, with its own baked-in SEO)
 *
 * This replaces the old nginx `map $host $spa_shell` trick. For any navigation
 * request on the loglens.* host, serve loglens.html; asset requests (anything
 * with a file extension) and all apex requests fall through to normal static
 * serving + the _redirects SPA fallback.
 */

interface Env {
  // Pages exposes the static-asset server as this fetcher binding.
  ASSETS: { fetch: (input: Request | string | URL) => Promise<Response> }
}

interface Ctx {
  request: Request
  env: Env
  next: () => Promise<Response>
}

export const onRequest = async (context: Ctx): Promise<Response> => {
  const url = new URL(context.request.url)
  // Wrangler's local server keeps request.url on localhost, while browsers
  // correctly send the requested domain in Host. Reading Host makes local
  // custom-domain testing match Cloudflare production behavior.
  const host = (context.request.headers.get('host') ?? url.hostname).split(':')[0]
  const isLoglensHost = /^loglens\./i.test(host)
  const looksLikeFile = /\.[a-z0-9]+$/i.test(url.pathname)

  if (isLoglensHost && !looksLikeFile) {
    return context.env.ASSETS.fetch(new URL('/loglens.html', url.origin))
  }
  return context.next()
}
