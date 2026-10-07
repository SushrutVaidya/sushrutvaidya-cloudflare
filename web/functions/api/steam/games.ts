/**
 * GET /api/steam/games — top 10 owned games by playtime.
 *
 * Port of SteamService.java. The API key + Steam ID are Pages secrets
 * (STEAM_API_KEY, STEAM_ID) — set them in the Pages project settings. When
 * unset, returns [] (same contract the frontend already treats as "not
 * configured"). Cloudflare edge-caches the upstream Steam call for an hour,
 * which replaces the backend's in-process TTL cache.
 */

interface Env {
  STEAM_API_KEY?: string
  STEAM_ID?: string
}

interface SteamGame {
  appid: number
  name?: string
  playtime_forever?: number
  playtime_2weeks?: number
}

export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
  const key = context.env.STEAM_API_KEY
  const id = context.env.STEAM_ID
  if (!key || !id) return Response.json([])

  try {
    const url =
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/' +
      `?key=${key}&steamid=${id}&include_appinfo=1&include_played_free_games=1&format=json`

    const res = await fetch(url, { cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit)
    if (!res.ok) return Response.json([])

    const data = (await res.json()) as { response?: { games?: SteamGame[] } }
    const games = data?.response?.games
    if (!Array.isArray(games)) return Response.json([])

    const top = games
      .slice()
      .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
      .slice(0, 10)
      .map((g) => ({
        title: g.name ?? 'Unknown',
        xp: Math.round((g.playtime_forever ?? 0) / 60),
        played: (g.playtime_2weeks ?? 0) > 0 ? 'Recently' : 'A while ago',
        appid: g.appid,
      }))

    return Response.json(top)
  } catch {
    // Never surface the error (its message can contain the key in the URL).
    return Response.json([])
  }
}
