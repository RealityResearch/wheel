'use server'

import { Connection, PublicKey } from '@solana/web3.js'
import { NextResponse } from 'next/server'

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(RPC_URL, 'confirmed')

interface VerifyRequest {
  mint: string
  addresses: string[]
}

export async function POST(request: Request) {
  try {
    const { mint, addresses }: VerifyRequest = await request.json()
    const mintPk = new PublicKey(mint)

    const results: Record<string, { eligible: boolean; reason?: string }> = {}

    await Promise.all(
      addresses.map(async addr => {
        try {
          const ownerPk = new PublicKey(addr)
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPk, {
            mint: mintPk
          })
          const eligible = tokenAccounts.value.some(
            acc => (acc.account.data as any).parsed.info.tokenAmount.uiAmount > 0
          )
          results[addr] = eligible ? { eligible } : { eligible, reason: 'No balance' }
        } catch (e) {
          results[addr] = { eligible: false, reason: 'RPC error' }
        }
      })
    )

    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
