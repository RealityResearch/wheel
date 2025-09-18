'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

/**
 * Switchboard delivers VRF results via webhook (POST).
 * Expected body (Switchboard v3 default):
 * {
 *   txSignature: string,
 *   result: string // hex-encoded 32-byte randomness
 * }
 */

const ENTRANTS_KEY = 'entrants:set'
const WINNERS_KEY = 'winners:list'
const COMMIT_KEY = 'vrf:commit'

export async function POST(req: Request) {
  const payload = await req.json()
  const { txSignature, result } = payload as { txSignature: string; result: string }
  if (!txSignature || !result)
    return NextResponse.json({ error: 'Malformed' }, { status: 400 })

  // fetch entrants snapshot atomically
  const entrants = await redis.smembers(ENTRANTS_KEY) as string[]
  if (!Array.isArray(entrants) || entrants.length === 0)
    return NextResponse.json({ error: 'No entrants' }, { status: 400 })

  const randomness = BigInt('0x' + result)
  const i = Number(randomness % BigInt(entrants.length))
  const address = entrants[i]

  const round = (await redis.llen(WINNERS_KEY)) + 1
  const record = { address, round, ts: Date.now(), vrfTx: txSignature }
  await redis.lpush(WINNERS_KEY, JSON.stringify(record))

  // optionally clear commit
  await redis.del(COMMIT_KEY)

  return NextResponse.json({ ok: true })
}
