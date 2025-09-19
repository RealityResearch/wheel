'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { requestRandomness } from '@/lib/randomness'

const ENTRANTS_KEY = 'entrants:list'
const REQUEST_PREFIX = 'rod:req:'

export async function POST() {
  try {
    const entrants = (await redis.lrange(ENTRANTS_KEY, 0, 49)) as string[]
    if (entrants.length === 0)
      return NextResponse.json({ error: 'No entrants' }, { status: 409 })

    const webhook = process.env.SB_ONDEMAND_WEBHOOK
    const { requestKey, txSignature } = await requestRandomness(webhook)

    // schedule next spin timestamp
    const intervalSec = 180
    await redis.set('nextSpinTs', Date.now() + intervalSec * 1000)

    // store meta for later lookup (TTL 10 min)
    await redis.set(`${REQUEST_PREFIX}${requestKey}`, JSON.stringify({ txSignature }), { ex: 600 })

    return NextResponse.json({ pending: true, requestKey, txSignature, nextSpinTs: Date.now() + intervalSec * 1000 })
  } catch (e) {
    return NextResponse.json({ error: 'Randomness request failed' }, { status: 502 })
  }
}
