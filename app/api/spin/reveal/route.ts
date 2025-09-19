// /api/spin/reveal – background worker (trigger via cron every 10s)
'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { revealRandomness, fetchRandomness } from '@/lib/randomness'
import { Connection } from '@solana/web3.js'

const PENDING_KEY = 'rand:pending'
const ENTRANTS_KEY = 'entrants:list'
const WIN_KEY = 'winners:list'

export async function POST() {
  try {
    const randPubkey = (await redis.lpop(PENDING_KEY)) as string | null
    if (!randPubkey) return NextResponse.json({ ok: true, msg: 'nothing to reveal' })

    // send reveal ix
    const revealSig = await revealRandomness(String(randPubkey))

    // small delay to allow oracle to process (not blocking for long)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // fetch randomness
    const rand = await fetchRandomness(String(randPubkey))
    if (!rand || (Array.isArray(rand) && rand.every((b: number) => b === 0))) {
      // not ready yet; push back to queue
      await redis.rpush(PENDING_KEY, randPubkey)
      return NextResponse.json({ ok: false, msg: 'randomness not ready, retry later' })
    }
    const entrants = (await redis.lrange(ENTRANTS_KEY, 0, -1)) as string[]
    if (!entrants.length)
      return NextResponse.json({ ok: false, msg: 'no entrants' })

    const randHex = Buffer.from(rand as Buffer).toString('hex')
    const randNum = Number(BigInt('0x' + randHex) % BigInt(entrants.length))
    const winnerAddr = entrants[randNum]

    const record = {
      address: winnerAddr,
      round: (await redis.llen(WIN_KEY)) + 1,
      ts: Date.now(),
      commitTx: '',
      revealTx: revealSig
    }

    await redis.lpush(WIN_KEY, JSON.stringify(record))

    // schedule next spin timestamp (3 min)
    await redis.set('nextSpinTs', Date.now() + 180000)

    return NextResponse.json({ ok: true, winner: winnerAddr })
  } catch (e) {
    console.error('reveal worker error', e)
    return NextResponse.json({ ok: false, error: (e as Error).message })
  }
}
