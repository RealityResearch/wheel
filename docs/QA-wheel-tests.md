# QA Checklist – Wheel Spin & Randomness Integration

## 1. Environment Setup
- [ ] `.env.local` contains `UPSTASH_`, `SB_ONDEMAND_` vars.
- [ ] `npm run dev` starts without TypeScript errors.

## 2. Entrant Flow
| Step | Action | Expected |
|------|--------|----------|
|2.1|Open app in two browsers (A, B)|Both show 0/50 slots| 
|2.2|In A, submit valid wallet|Row #1 fills with address; B reflects within 2 s| 
|2.3|Submit 51 wallets (script or manual)|First 50 fill slots, 51st appears in Waitlist| 

## 3. Spin Trigger (Dev Stub)
| Step | Action | Expected |
|------|--------|----------|
|3.1|Click **Spin**|Button disables / spinner state| 
|3.2|Wheel waits (polling)|`/api/spin` responds `{pending:true}`; subsequent `/api/spin/{key}` return `pending` until stub supplies randomness| 
|3.3|Wheel animates|~16 s animation, pointer lands on winner segment| 
|3.4|Winners table updates|New row appears with address & `View` link (`dev-tx`)| 
|3.5|Browsers sync|B shows same winner within 2 s; slots rotate (waitlist promotes)| 

## 4. Edge Cases
| # | Scenario | Expected |
|---|----------|----------|
|4.1|Spin with 0 entrants|Toast/Error: "No entrants"| 
|4.2|Double-click Spin rapidly|Second request rejected while `spinning` true| 
|4.3|Reload page mid-spin|On load provider fetches entrants; wheel idle; winners intact| 
|4.4|Backend down (kill dev server)|Frontend shows error toast; wheel resets `spinning=false`| 

## 5. VRF Ready (Future)
- [ ] `/api/spin/{key}` return includes real `tx`, Verify link resolves on explorer.
- [ ] Callback writes winner to Redis; no polling needed.

---