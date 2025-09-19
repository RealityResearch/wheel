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
  try {
    const raw = await redis.hgetall(KEY).catch(() => ({}))
    const stored = (raw ?? {}) as Record<string, string>

    const timerSecRaw = Number(stored.timerSec)
    const timerSec = Number.isFinite(timerSecRaw) && timerSecRaw > 0 ? timerSecRaw : defaults.timerSec
    const settings: Settings = { ...defaults, ...stored, timerSec }

    const initTs = Date.now() + timerSec * 1000
    let nextSpinTs = Number(await redis.get('nextSpinTs').catch(() => 0))
    if (!Number.isFinite(nextSpinTs) || nextSpinTs < Date.now()) {
      nextSpinTs = initTs
      await redis.set('nextSpinTs', String(nextSpinTs))
    }

    return NextResponse.json({ settings, nextSpinTs })
  } catch {
    const nextSpinTs = Date.now() + defaults.timerSec * 1000
    return NextResponse.json({ settings: defaults, nextSpinTs, error: 'state fallback' })
  }
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