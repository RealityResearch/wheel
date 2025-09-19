// lib/randomness.ts  – Switchboard On-Demand v2 (commit-reveal)
import * as sb from '@switchboard-xyz/on-demand'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

const RPC    = process.env.SB_ONDEMAND_RPC as string
const SECRET = process.env.SB_ONDEMAND_SECRET as string

// obtain { keypair, connection, program } using AnchorUtils or fallback manual
async function getCtx() {
  try {
    const cfg = await sb.AnchorUtils.loadEnv()   // loads keypair, connection, program
    return { keypair: cfg.keypair, connection: cfg.connection, program: cfg.program }
  } catch {
    const keypair = Keypair.fromSecretKey(bs58.decode(SECRET))
    const connection = new Connection(RPC, 'processed')
    // load default program from env helper
    const program = (await sb.AnchorUtils.loadProgramFromEnv()) as any
    return { keypair, connection, program }
  }
}

// create + commit randomness account – returns its public key and tx sig
export async function createCommitRandomness() {
  const { keypair, connection, program } = await getCtx()

  const randKp = Keypair.generate()

  // create account
  const [randAcc, initIx] = await sb.Randomness.create(
    program,
    randKp,
    sb.ON_DEMAND_DEVNET_QUEUE_PDA,
    keypair.publicKey
  )

  // commit to current slot + 1
  const commitIx = await randAcc.commitIx(sb.ON_DEMAND_DEVNET_QUEUE_PDA)

  const tx = new Transaction().add(initIx, commitIx)
  const sig = await connection.sendTransaction(tx, [keypair, randKp])

  return { randomnessPubkey: randAcc.pubkey, sig }
}

// reveal randomness for a given account once commit slot has passed
export async function revealRandomness(randPubkey: string) {
  const { keypair, connection, program } = await getCtx()
  const acc = new sb.Randomness(program, new PublicKey(randPubkey))
  const revealIx = await acc.revealIx()
  const tx = new Transaction().add(revealIx)
  const sig = await connection.sendTransaction(tx, [keypair])
  return sig
}

// load revealed random value – returns Uint8Array(32)
export async function fetchRandomness(randPubkey: string) {
  const { program } = await getCtx()
  const acc = new sb.Randomness(program, new PublicKey(randPubkey))
  const data = await acc.loadData()
  return data.randomValue as Uint8Array
}