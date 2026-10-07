# Cloudflare Pages deployment runbook

This deploys the portfolio and LogLens from one free Cloudflare Pages project.

```text
sushrutvaidya.in             -> main portfolio (`index.html`)
loglens.sushrutvaidya.in     -> LogLens shell (`loglens.html`)
```

Cloudflare Pages Functions replace the small website APIs (`/api/stats`,
`/api/jukebox/tracks`, counters, and Steam games). The old GCP VM remains the
rollback until production has been verified.

## Free-tier boundaries

- Pages static requests are free and unlimited.
- Pages Functions share the Workers Free allowance: 100,000 requests/day.
- Workers KV free allowance: 100,000 reads/day, 1,000 writes/day, 1 GB stored.
- Pages asset limit: 25 MiB for a single file. The current largest asset is
  below that limit.
- No database or Neon instance is required for this site.

## 1. Build locally

Run from the `web` directory:

```sh
cd ~/Documents/Github/Portfolio-Frontend/web
npm run build:pages
```

This creates `dist/`, including static assets, redirects, and the Pages
Functions source from `functions/`.

## 2. Test locally

Use an unused port. If `8788` is occupied, use `8789`.

```sh
npx wrangler pages dev dist --port 8789 --kv=COUNTERS
```

In another terminal:

```sh
# Main API
curl -s http://127.0.0.1:8789/api/stats

# Jukebox: expect 7 tracks
curl -s http://127.0.0.1:8789/api/jukebox/tracks | grep -o '"title"' | wc -l

# Canonical redirect: expect Location: https://loglens.sushrutvaidya.in/
curl -sI http://127.0.0.1:8789/loglens | grep -i '^location:'

# Deep portfolio route: expect HTTP 200
curl -so /dev/null -w '%{http_code}\n' http://127.0.0.1:8789/work/loglens
```

### Testing the LogLens hostname locally

```sh
curl --noproxy '*' \
  --resolve loglens.sushrutvaidya.in:8789:127.0.0.1 \
  http://loglens.sushrutvaidya.in:8789/ | grep '<title>'
```

`wrangler pages dev` may normalize the hostname to localhost. The definitive
hostname test is therefore the `pages.dev` preview in step 4.

## 3. First-time Cloudflare project setup

1. Cloudflare Dashboard -> **Workers & Pages** -> **Create application** ->
   **Pages**.
2. Connect GitHub and choose this repository.
3. Create project: `sushrutvaidya`; production branch: `main`.
4. Configure build settings:
   - Root directory: `web`
   - Build command: `npm run build:pages`
   - Output directory: `dist`
5. In **Settings -> Bindings**, create/select a KV namespace and bind it as
   `COUNTERS`.
6. In **Settings -> Variables and Secrets**, add encrypted production and
   preview secrets: `STEAM_API_KEY`, `STEAM_ID`.

Do not store secret values in Git or `.env` files committed to Git.

## 4. Deploy and test a safe preview

```sh
cd ~/Documents/Github/Portfolio-Frontend/web
npx wrangler login
npx wrangler pages project list
npx wrangler pages deploy dist --project-name=sushrutvaidya --branch=preview
```

Copy the `*.pages.dev` URL printed by the deploy. Test it:

```sh
# Replace PREVIEW_URL with the URL from Wrangler.
curl -sI PREVIEW_URL
curl -s PREVIEW_URL/api/stats
curl -s PREVIEW_URL/api/jukebox/tracks
```

The subdomain routing must be tested after the custom domain is attached in
step 6, because local Wrangler mode may not retain the requested host name.

## 5. Deploy production assets

Only after the preview passes:

```sh
npx wrangler pages deploy dist --project-name=sushrutvaidya --branch=main
```

## 6. Attach real domains and verify

In Pages -> `sushrutvaidya` -> **Custom domains**, add both:

```text
sushrutvaidya.in
loglens.sushrutvaidya.in
```

Move the domain's DNS/nameservers to Cloudflare only when Cloudflare asks for
it and both `pages.dev` tests pass. Cloudflare then provisions TLS.

After DNS propagates:

```sh
curl -s https://sushrutvaidya.in/ | grep '<title>'
curl -s https://loglens.sushrutvaidya.in/ | grep '<title>'
curl -sI https://sushrutvaidya.in/loglens | grep -i '^location:'
curl -s https://sushrutvaidya.in/api/stats
curl -s https://loglens.sushrutvaidya.in/api/jukebox/tracks
```

Expected titles:

```text
sushrutvaidya.in: Sushrut Vaidya · Platform Engineer
loglens.sushrutvaidya.in: loglens · readable logs in the terminal
```

## Rollback

Do not delete the GCP VM during migration. If the Cloudflare deployment fails,
restore the former DNS records at the registrar/Cloudflare DNS and the VM keeps
serving the existing site.

## Current implementation notes

- `web/functions/_middleware.ts` chooses the LogLens HTML shell from the
  request host.
- `web/public/_redirects` redirects `/loglens` to the LogLens subdomain.
- Wrangler currently warns about the SPA fallback (`/* /index.html 200`);
  verify direct deep links on the Pages preview before switching DNS.
