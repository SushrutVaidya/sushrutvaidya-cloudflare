/**
 * GET /api/rickroll — increments and returns the easter-egg counter.
 * Backed by the COUNTERS KV namespace (bind it in Pages settings). If KV is
 * not bound yet, returns a harmless 0 so the UI never errors.
 */

interface KV {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string) => Promise<void>
}
interface Env {
  COUNTERS?: KV
}

export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
  const kv = context.env.COUNTERS
  if (!kv) return Response.json({ count: 0 })
  const next = (parseInt((await kv.get('rickroll')) ?? '0', 10) || 0) + 1
  await kv.put('rickroll', String(next))
  return Response.json({ count: next })
}
