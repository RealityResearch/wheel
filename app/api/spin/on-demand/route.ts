'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const ENT_KEY = 'entrants:set'
const WIN_KEY = 'winners:list'
const REQ_PREFIX = 'rod:req:'

interface WebhookBody {
  requestKey: string
  randomness: string // hex string without 0x
  txSignature: string
}

export async function POST(req: Request) {
  const { requestKey, randomness, txSignature } = (await req.json()) as WebhookBody
  if (!requestKey || !randomness) return NextResponse.json({ ok: false })

  // dedupe by setnx
  const doneKey = `${REQ_PREFIX}${requestKey}:done`
  const first = await redis.setnx(doneKey, '1')
  if (first === 0) return NextResponse.json({ ok: true }) // already processed
  await redis.expire(doneKey, 600)

  const entrants = (await redis.smembers(ENT_KEY)) as string[]
  if (entrants.length === 0) return NextResponse.json({ ok: true })

  const idx = Number(BigInt('0x' + randomness) % BigInt(entrants.length))
  const round = (await redis.llen(WIN_KEY)) + 1
  const record = { address: entrants[idx], round, ts: Date.now(), vrfTx: txSignature }
  await redis.lpush(WIN_KEY, JSON.stringify(record))

  // schedule next spin 3 min later
  await redis.set('nextSpinTs', Date.now() + 180000)

  return NextResponse.json({ ok: true })
}
