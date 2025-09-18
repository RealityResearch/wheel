'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const KEY = 'entrants:set'

// 50 sample Solana wallets (public keys) – dev only
const SAMPLE_WALLETS = [
  '3hX5Zqj1YAGP82LPgAvFp8ZUBKbjrKMgVkpXBJgp7wa5',
  '7m3uTJS3BM4tiTqcKoysznZZF9RnBbTK1Z4VHKs3P6Ky',
  'C98yQP7SKsWvd9FTJMcjsBvnyvJkn4ypu32n7Z1xXK2B',
  '2RDopn7HxVn9Yx8uWb1x1o1t4bmPqhGV8eK3vpYVetwc',
  '8tHbdDg7sHXBJgp7wa53hX5Zqj1YAGP82LPgAvFp8ZUB',
  '9YgP82LPgAvFp8ZU5Zqj1YAGP83hX5rsHdDg7sHXBJjD',
  'GvJkn4ypu32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvn',
  'H1sN52LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP82JPd4',
  'JX5rsHdDg7sHXBJgp7wa53hX5Zqj1YAGP82LPgAvTp8Z',
  'KoysznZZF9RnBbTK1Z4VHKs3P6Ky7m3uTJS3BM4tiTqc',
  'LbnjrKMgVkpXBJgp7wa53hX5Zqj1YAGP82LPgAvFq8ZP',
  'M2n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJkn4ypr',
  'N4ypu32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJk',
  'P6Ky7m3uTJS3BM4tiTqcKoysznZZF9RnBbTK1Z4VHKs3',
  'QJBj1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP9',
  'R1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJkn4ypu32n7',
  'Sg7sHXBJgp7wa53hX5Zqj1YAGP82LPgAvFp8ZU9YgP82',
  'TJS3BM4tiTqcKoysznZZF9RnBbTK1Z4VHKs37m3uP6Ky',
  'U32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJkn4yp',
  'V9FTJMcjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKsWv',
  'Wvd9FTJMcjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKs',
  'X1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP93hX',
  'YgP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP83hX5rs',
  'Zqj1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP83',
  '11qpu32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJk',
  '22LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP82P6Ky7m3u',
  '33Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJkn4ypu32',
  '44bmjrKMgVkpXBJgp7wa53hX5Zqj1YAGP82LPgAvFp8Z',
  '55TK1Z4VHKs3P6Ky7m3uTJS3BM4tiTqcKoysznZZF9Rn',
  '66nBbTK1Z4VHKs3P6Ky7m3uTJS3BM4tiTqcKoysznZZF',
  '77d9FTJMcjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKs',
  '88LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP82hX5rsHdD',
  '99m3uTJS3BM4tiTqcKoysznZZF9RnBbTK1Z4VHKs3P6K',
  'AAWvd9FTJMcjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7S',
  'BB1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP93h',
  'CCjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKsWvd9FTJ',
  'DDtqcKoysznZZF9RnBbTK1Z4VHKs37m3uTJS3BM4tiTq',
  'EEBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKsWvd9FTJMc',
  'FFtkcKoysznZZF9RnBbTK1Z4VHKs37m3uTJS3BM4tiTq',
  'GGZqj1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP',
  'HHn7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJkn4ypu',
  'IIWvd9FTJMcjsBvnGvJkn4ypu32n7Z1xXK2BC98yQP7S',
  'JJtk3hX5Zqj1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zq',
  'KKP6Ky7m3uTJS3BM4tiTqcKoysznZZF9RnBbTK1Z4VHK',
  'LLqpu32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJk',
  'MMP82LPgAvFp8ZUBKbjrKMgVk3hX5Zqj1YAGP82hX5rs',
  'NNBvnGvJkn4ypu32n7Z1xXK2BC98yQP7SKsWvd9FTJMc',
  'OOw53hX5Zqj1YAGP82LPgAvFp8ZUBKbjrKMgVk3hX5Zq',
  'PPKoysznZZF9RnBbTK1Z4VHKs3P6Ky7m3uTJS3BM4tiT',
  'QQypu32n7Z1xXK2BC98yQP7SKsWvd9FTJMcjsBvnGvJk'
]

export async function GET() {
  // fetch entrants
  const membersRaw = await redis.smembers(KEY)
  let members = membersRaw as string[]

  // dev seed once if empty
  if (members.length === 0 && process.env.NODE_ENV !== 'production') {
    for (const w of SAMPLE_WALLETS) await redis.sadd(KEY, w)
    members = [...SAMPLE_WALLETS]
  }

  // stable order for UI
  members.sort()
  return NextResponse.json({ entrants: members })
}

export interface AddEntrantBody {
  address: string
}

export async function POST(req: Request) {
  try {
    const { address }: AddEntrantBody = await req.json()
    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 })

    await redis.sadd(KEY, address)
    const count = await redis.scard(KEY)
    return NextResponse.json({ ok: true, count })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE() {
  await redis.del(KEY)
  return NextResponse.json({ ok: true })
}
