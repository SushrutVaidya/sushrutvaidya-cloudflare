/** GET /api/rickroll/count — read-only counter. */

interface KV {
  get: (key: string) => Promise<string | null>
}
interface Env {
  COUNTERS?: KV
}

export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
  const kv = context.env.COUNTERS
  const count = kv ? parseInt((await kv.get('rickroll')) ?? '0', 10) || 0 : 0
  return Response.json({ count })
}
