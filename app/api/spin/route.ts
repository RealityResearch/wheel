'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { createCommitRandomness } from '@/lib/randomness'

const ENTRANTS_KEY = 'entrants:list'
const REQUEST_PREFIX = 'rod:req:'

export async function POST() {
  try {
    const entrants = (await redis.lrange(ENTRANTS_KEY, 0, 49)) as string[]
    if (entrants.length === 0)
      return NextResponse.json({ error: 'No entrants' }, { status: 409 })

    const { randomnessPubkey, sig } = await createCommitRandomness()
    console.log('randomness commit', randomnessPubkey.toBase58(), sig)

    // schedule next spin timestamp
    const intervalSec = 180
    await redis.set('nextSpinTs', Date.now() + intervalSec * 1000)

    await redis.rpush('rand:pending', randomnessPubkey.toBase58())

    return NextResponse.json({ pending: true, randomnessPubkey: randomnessPubkey.toBase58(), commitSig: sig, nextSpinTs: Date.now() + intervalSec * 1000 })
  } catch (e) {
    console.error('Spin route error', (e as Error).message)
    return NextResponse.json({ error: 'Randomness request failed' }, { status: 502 })
  }
}
