'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const KEY = 'settings:hash'
const defaults = {
  timerSec: 180,
  autoSpin: false,
  tokenGate: false,
  mint: ''
}

type Settings = typeof defaults

export async function GET() {
  const raw = await redis.hgetall(KEY)
  const stored = raw as Record<string, string>
  const timerSec = Number(stored.timerSec ?? defaults.timerSec)
  const settings: Settings = { ...defaults, ...stored, timerSec }
  // ensure global timestamp exists
  const initTs = Date.now() + timerSec * 1000
  let nextSpinTs = Number(await redis.get('nextSpinTs'))
  if (!nextSpinTs || nextSpinTs < Date.now()) {
    nextSpinTs = initTs
    await redis.set('nextSpinTs', nextSpinTs)
  }
  return NextResponse.json({ settings, nextSpinTs })
}

export async function PATCH(req: Request) {
  try {
    const partial: Partial<Settings> = await req.json()
    await redis.hset(KEY, partial as any)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
