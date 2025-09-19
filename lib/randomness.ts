import { Keypair, Connection } from '@solana/web3.js'
// dynamic import handles different export styles
// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-ignore
const SB = require('@switchboard-xyz/on-demand')
// resolve constructor regardless of export style
// @ts-ignore
const OnDemandClient = SB?.OnDemandClient || SB?.default || SB
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
  const client = await getClient()
  return client.requestRandomness({ webhookUrl: webhook })
}

export async function getRandomness(requestKey: string) {
  const client = await OnDemandClient.connect(new Connection(RPC, 'confirmed'))
  return client.getRandomness(requestKey)
}
