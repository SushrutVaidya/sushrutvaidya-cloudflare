/**
 * GET /api/print-request/count — resume-print giveaway counter (cap 25).
 * Read-only; the frontend only displays claimed/remaining. KV-backed, graceful
 * when KV is unbound.
 */

interface KV {
  get: (key: string) => Promise<string | null>
}
interface Env {
  COUNTERS?: KV
}

const CAP = 25

export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
  const kv = context.env.COUNTERS
  const claimed = kv ? parseInt((await kv.get('print-request')) ?? '0', 10) || 0 : 0
  return Response.json({ claimed, remaining: Math.max(0, CAP - claimed), full: claimed >= CAP })
}
