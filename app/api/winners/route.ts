'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const KEY = 'winners:list'

export async function GET() {
  const raw = await redis.lrange(KEY, 0, -1)
  const winners = raw.flatMap((w) => {
    try {
      return [JSON.parse(w)]
    } catch {
      return []
    }
  })
  return NextResponse.json({ winners })
}

interface WinnerBody {
  address: string
  round: number
}

export async function POST(req: Request) {
  try {
    const { address, round }: WinnerBody = await req.json()
    if (!address || round === undefined)
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const record = { address, round, ts: Date.now() }
    await redis.lpush(KEY, JSON.stringify(record))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
