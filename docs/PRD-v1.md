## 1. Overview
We are building a **Solana raffle wheel application** to run automated, token-gated raffles during livestreams. The system collects wallet submissions, validates eligibility, and spins a visually engaging wheel at timed intervals to pick winners.  

The project will be built in **Next.js (App Router)** with **React, TailwindCSS, and shadcn/ui** for frontend, plus a lightweight **backend using Redis (Upstash)** that exposes API routes for both token verification and real-time shared state.

---

## 2. Objectives
- Provide an interactive, **stream-ready raffle wheel**.
- Ensure **fair, random selection** from eligible entrants.
- Prevent spam with **one wallet per browser** + optional token gating.
- Build with **Next.js** for modern DX, routing, and API hosting.

---

## 3. Core Features

### 3.1 Entrant Submission
- **Frontend Form**
  - Single textarea input for Solana wallet.
  - One entry per browser enforced with `localStorage`.
- **Validation**
  - Basic Solana Base58 check.
- **Persistence**
  - Stored centrally in **Redis** (`entrants:set`) and cached in `localStorage` under `raffleWallet` for deduplication.

### 3.2 Token Holding Verification
- **UI Toggle**: “Require holding token.”
- **Admin Input**: SPL token mint.
- **Backend**: Next.js API route (`/api/verify`).
  - Input: `{ mint, addresses }`
  - Process: query Solana RPC for token balance.
  - Output: `{ results: { address: { eligible, reason? } } }`
- **Frontend Behavior**:
  - Mark ineligible addresses, exclude from pool.

### 3.3 Raffle Wheel
- **Visible Slots**: ~24 addresses for readability.
- **Fairness**: Winner index provided by backend VRF endpoint, then wheel animates to that slot.
- **Provably Random**: Uses on-chain **Solana VRF** (Switchboard v3) – each spin submits a request, backend waits for fulfillment, then reveals the random index.
- **Animation**: Framer Motion, 5+ rotations before stopping.
- **Pointer**: Fixed top indicator.

### 3.4 Timer & Auto-Spin
- **Countdown Timer** (default 3 min).
- **Auto-spin toggle**:
  - Spins automatically on countdown.
  - Pause/resume option.
- **Manual spin**: always available.
- **Interval Control**: admin adjustable.

### 3.5 Winners Table
- **Data Display**:
  - Round, address, timestamp, **Verify link**.
- **Verify Column**:
  - Links to Solana Explorer showing VRF proof tx for that round.
- **UI**:
  - shadcn/ui `Card` + table.
- **Note**: **No export button** — winners visible only in-app.

---

## 4. Guardrails
- **One wallet per browser**:
  - Enforced client-side with `localStorage`.
  - Rejections if attempting a new address from same browser.
- **Optional Token Gate**:
  - Filters spam/empty wallets.
- **Future Hardening**:
  - Signature verification (sign nonce).
  - Server-side deduplication by IP/UA.
  - Rate-limiting API calls.

---

## 5. Technical Requirements

### 5.1 Frontend (Next.js)
- Framework: **Next.js 14+ (App Router)**.
- Styling: **TailwindCSS**.
- Components: **shadcn/ui** (Cards, Buttons, Inputs, Labels, Textarea, Badges).
- Animation: **Framer Motion**.
- State management: React hooks.
- Persistence: **Redis (Upstash)** for shared state; `localStorage` as client-side cache.

### 5.2 Backend (Next.js API Routes)
- Endpoint: `/api/verify`.
- Input: `{ mint: string, addresses: string[] }`.
- Output: JSON eligibility map.
- RPC: Solana JSON-RPC (Helius, QuickNode).
- Deployable within Next.js app (Vercel-native).
- **Endpoint: `/api/spin`** (POST)
  - Initiates a Switchboard VRF request.
  - Waits (edge function + webhook) for fulfillment.
  - Computes `winnerIndex = randomness % entrants.length`.
  - Persists winner + VRF tx sig to Redis.

### 5.3 Shared State Service (Redis)
- **Store**: Managed Redis instance (Upstash).
- **Data Keys**:
  - `entrants:set` — all validated wallet addresses.
  - `winners:list` — ordered winners history.
    - Each item: `{ address, round, ts, vrfTx }`.
  - `settings:hash` — raffle configuration (timer, auto-spin, token gate).
- **API Routes**: `/api/entrants`, `/api/winners`, `/api/state` (REST over HTTPS).
- **Consistency**: All writes funnel through API; clients refresh via polling (1–2s) with roadmap to SSE/WebSockets for push updates.
- **Expiry**: TTL per raffle session (e.g., 24 h) to minimize cost.
- **Security**: CORS locked to app origin; admin-only write endpoints secured via secret header.

### 5.4 Scalability
- Handle **500+ entrants**.
- Batch verification requests (100 addresses).
- Apply concurrency control.

---

## 6. UX/UI Notes
- **Entrants Card**:
  - Single wallet entry, ingest, clear/reset.
  - Badges for parsed addresses.
- **Wheel Card**:
  - Large central animated wheel with pointer.
- **Controls**:
  - Countdown display, interval input, auto-spin toggle, manual spin.
- **Winners Card**:
  - Minimal table, no export.

---

## 7. Stretch Goals
- Weighted odds (by token balance).
- Signature-bound entry (prove wallet ownership).
- Trivia/multiplier/bracket games.
- “Overlay mode” — wheel + winners only, for OBS streams.

---

## 8. Success Criteria
- Smooth operation with 500+ wallets.
- Provably random selection verified on-chain (VRF tx link in UI).
- One-wallet-per-browser working reliably.
- Token verification integrated into Next.js backend.
- All UI built with **shadcn/ui**, styled with **TailwindCSS**.
- Fully deployable as a Next.js app (frontend + API in one project).