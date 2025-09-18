# Deployment PRD – Raffle Wheel v1.1

## Scope
Productionise the Solana raffle wheel with verifiable randomness and custom domain on Vercel.

## Objectives
1. Pass Vercel build with zero TypeScript errors.
2. Serve on custom domain via Vercel + HTTPS.
3. Integrate Switchboard On-Demand VRF – winners include on-chain tx link.
4. Auto-spin every 3 min; countdown pauses during spin.
5. Stable UI: entrants table order fixed, single green slice colour.

## Tasks & Status
| # | Task | Owner | Status |
|---|------|-------|--------|
|1| Fix SDK import (`OnDemandClient`) | dev | ✅ |
|2| Correct Redis `smembers` typing | dev | ✅ |
|3| Eliminate remaining build errors (3) | dev | ⬜ |
|4| Deploy to Vercel, set env vars | dev | ⬜ |
|5| Point domain & issue SSL | ops | ⬜ |
|6| Replace dev randomness stubs | dev | ⬜ |
|7| Remove polling loop & sample entrants | dev | ⬜ |

## Environment Variables (Vercel)
```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SB_ONDEMAND_RPC=https://api.mainnet-beta.solana.com
SB_ONDEMAND_SECRET=<base58 secret key>
SB_ONDEMAND_WEBHOOK=https://<domain>/api/spin/on-demand
```

## Build Issues Tracker
1. `@switchboard-xyz/on-demand` named export ✅ fixed
2. Redis generic type error ✅ fixed
3. Pending errors – investigate after next build log

---
Last updated: YYYY-MM-DD
