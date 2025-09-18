import { Keypair, Connection } from '@solana/web3.js'
import OnDemandClient from '@switchboard-xyz/on-demand'
import bs58 from 'bs58'

const RPC = process.env.SB_ONDEMAND_RPC!
const SECRET = process.env.SB_ONDEMAND_SECRET!

async function getClient() {
  const keypair = Keypair.fromSecretKey(bs58.decode(SECRET))
  const connection = new Connection(RPC, { commitment: 'confirmed' })
  const client = await OnDemandClient.connect(connection, keypair)
  return client
}

export async function requestRandomness(webhook?: string) {
  if (process.env.NODE_ENV !== 'production') {
    return { requestKey: crypto.randomUUID(), txSignature: 'dev-tx' } as any
  }
  const client = await getClient()
  return client.requestRandomness({ webhookUrl: webhook })
}

export async function getRandomness(requestKey: string) {
  if (process.env.NODE_ENV !== 'production') {
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(Math.floor(Math.random() * 2 ** 32))
    return { randomness: buf, txSignature: 'dev-tx' } as any
  }
  const client = await OnDemandClient.connect(new Connection(RPC, 'confirmed'))
  return client.getRandomness(requestKey)
}
