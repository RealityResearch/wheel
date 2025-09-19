// lib/randomness.ts
import { Keypair, Connection } from '@solana/web3.js'
import bs58 from 'bs58'

// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-ignore – CJS
const Switchboard = require('@switchboard-xyz/on-demand')
// default export *is* the client
const OnDemandClient = Switchboard.default ?? Switchboard

const RPC    = process.env.SB_ONDEMAND_RPC as string
const SECRET = process.env.SB_ONDEMAND_SECRET as string

async function getClient() {
  const kp   = Keypair.fromSecretKey(bs58.decode(SECRET))
  const conn = new Connection(RPC, { commitment: 'confirmed' })
  return new OnDemandClient(conn, kp)
}

export async function requestRandomness(webhook?: string) {
  const client = await getClient()
  return client.requestRandomness({ webhookUrl: webhook })
}

export async function getRandomness(requestKey: string) {
  const client = await getClient()
  return client.getRandomness(requestKey)
}