import { Connection, PublicKey, Keypair } from '@solana/web3.js'
// @ts-ignore optional dev import
import { SwitchboardProgram, VrfAccount } from '@switchboard-xyz/solana.js'

/**
 * Wrapper around Switchboard VRF for serverless environment.
 * In dev, returns Math.random(); in prod, fires an on-chain request.
 */
export async function requestRandomness(): Promise<{ randomness: bigint; tx: string }> {
  if (process.env.NODE_ENV !== 'production') {
    // Dev stub
    const r = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
    return { randomness: r, tx: 'dev-tx' }
  }
  // TODO: implement real Switchboard client logic here using env vars
  // const connection = new Connection(process.env.SOLANA_RPC_URL!)
  // const program = await SwitchboardProgram.load(
  //   connection,
  //   new PublicKey(process.env.SWITCHBOARD_PROGRAM_ID!)
  // )
  // ...create VRF account, request randomness, await callback...
  throw new Error('Switchboard VRF not implemented')
}
