'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { getRandomness } from '@/lib/randomness'

const ENTRANTS_KEY = 'entrants:set'
const REQUEST_PREFIX = 'rod:req:'
const WINNERS_KEY = 'winners:list'

export async function GET(_req: Request, { params }: { params: { key: string } }) {
  const { key } = params
  const metaRaw = await redis.get(`${REQUEST_PREFIX}${key}`)
  if (!metaRaw) return NextResponse.json({ error: 'Unknown key' }, { status: 404 })

  const res = await getRandomness(key)
  if (!res.randomness)
    return NextResponse.json({ status: 'pending', tx: res.txSignature })

  const entrants = (await redis.smembers(ENTRANTS_KEY)) as string[]
  const i = Number(BigInt('0x' + res.randomness.toString('hex')) % BigInt(entrants.length))

  // persist winner once per requestKey (use SETNX)
  const winnerKey = `${REQUEST_PREFIX}${key}:done`
  const already = await redis.setnx(winnerKey, '1')
  if (already === 1) {
    const round = (await redis.llen(WINNERS_KEY)) + 1
    const record = { address: entrants[i], round, ts: Date.now(), vrfTx: res.txSignature }
    await redis.lpush(WINNERS_KEY, JSON.stringify(record))
    await redis.expire(winnerKey, 600)
  }

  return NextResponse.json({ status: 'ready', i, address: entrants[i], tx: res.txSignature })
}
