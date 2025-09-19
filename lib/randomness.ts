import { Keypair, Connection } from '@solana/web3.js'
// dynamic import handles both v1 and v2 SDK structures
// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-ignore
const Switchboard = require('@switchboard-xyz/on-demand')
// v1: Switchboard.OnDemandClient, v2: Switchboard.default
// @ts-ignore
const OnDemandClient = Switchboard.OnDemandClient || Switchboard.default
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
