'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { requestRandomness } from '@/lib/randomness'

const ENTRANTS_KEY = 'entrants:set'
const REQUEST_PREFIX = 'rod:req:'

export async function POST() {
  const entrants = (await redis.smembers(ENTRANTS_KEY)) as string[]
  if (!Array.isArray(entrants) || entrants.length === 0)
    return NextResponse.json({ error: 'No entrants' }, { status: 400 })

  const webhook = process.env.SB_ONDEMAND_WEBHOOK
  const { requestKey, txSignature } = await requestRandomness(webhook)

  // store meta for later lookup (TTL 10 min)
  await redis.set(`${REQUEST_PREFIX}${requestKey}`, JSON.stringify({ txSignature }), { ex: 600 })

  return NextResponse.json({ pending: true, requestKey, txSignature })
}
