# 🌾 KrishiBundle — Product Requirements Document (PRD)
### Shared Agricultural Logistics Marketplace — Hackathon MVP (1 Week, Team of 6)
### Problem Statement: AgriTech #65 — Post-harvest loss reduction (logistics-optimisation angle)

---
 In same app I want login for farmer,driver and admin for them to use this app and I will export this app as a apk so set that as well 

## 1. Product Vision

KrishiBundle is a software-only agricultural logistics marketplace that lets small farmers share
already-moving vehicle capacity (e.g. a pesticide-delivery vehicle returning empty) instead of
depending on large farmers/traders or hiring a full vehicle themselves. The system understands a
farmer's shipment request (via voice or text, in their own language), bundles compatible produce
from multiple nearby farmers into one optimized trip, computes a transparent fair price, lets
drivers bid on the trip, and gives the driver an optimized multi-pickup route — all with a human
admin able to override the AI at every step.

**One-line pitch:** *"KrishiBundle turns unused return-trip vehicle capacity into affordable,
transparent, AI-optimized shared transport for small farmers."*

---

## 2. Why This Maps to AgriTech #65

The stated problem (#65) is produce loss between harvest and market due to poor storage,
handling, and **logistics**, with "logistics optimisation" explicitly listed as an expected
solution component. KrishiBundle addresses the *market-access and transport-cost* root cause of
that loss — most teams under this statement will default to cold-chain/sensing hardware;
KrishiBundle differentiates by solving the fragmented-transport half of the problem with pure
software and an explainable optimization engine.

---

## 3. Users / Personas



| Persona | Need | Primary Interface |
|---|---|---|
| **Small Farmer** | Send a small quantity of produce to market cheaply, without owning/hiring a vehicle | React Native app (farmer tabs), voice or text input |
| **Driver** | Monetize unused return-trip capacity | React Native app (driver tabs) |
| **Admin/Ops** | Monitor orders, verify low-confidence voice orders, override AI, resolve disputes | Web dashboard (Next.js) |

---

## 4. Core Feature Pillars (Full Vision)

1. **AI Voice & Language Layer** — Farmer speaks or types in Tamil / Telugu / Malayalam / Hindi /
   English; system extracts a structured order and communicates back to the farmer in their
   chosen language for the entire order lifecycle (not just the first confirmation).
2. **Intelligent Matching & Bundling Engine** — Filters and clusters farmers into a shared trip
   based on vehicle capacity, current cargo, crop compatibility, route deviation, and timing.
3. **Route & Fair-Price Engine** — Computes optimized multi-pickup route and a fair-price range
   (not just cheapest-wins), plus a fair per-farmer cost split.
4. **Transparent Driver Marketplace** — Eligible drivers see the trip and bid; farmer accepts the
   recommended or a chosen offer.
5. **Admin Control Layer** — Full visibility + manual override on every automated decision.

---

## 5. MVP Scope for the 1-Week Build (What We Actually Build)

Static/simulated data is explicitly acceptable per team decision. The goal is a **complete,
working demo loop**, not production infrastructure. Real vs. simulated components:

| Component | MVP Treatment | Why |
|---|---|---|
| Order intake (text) | ✅ Real | Core to the demo, easy in RN |
| Order intake (voice) | ✅ **Real, but in-app mic** — use device-native speech-to-text (`@react-native-voice/voice`), not a phone call/IVR | Android speech recognition already supports Tamil/Telugu/Malayalam/Hindi natively — this is a real feature achievable in days, unlike telephony (Twilio/Exotel + call routing), which is a multi-week problem on its own |
| NLU extraction (transcript → structured order) | ✅ Real | One LLM call with a structured-output prompt (crop, qty, pickup, destination, date) |
| AI confidence check + admin escalation | ✅ Real (simplified threshold) | Cheap to implement, strong "we thought about failure modes" story for judges |
| Multilingual farmer-facing messages | ✅ Real, but **template-based i18n**, not live translation | Order confirmations, offers, and status updates are structured (crop/qty/market/fare/date are known variables) — pre-written localized templates per language (`react-i18next`) are more reliable than LLM-translating dynamic financial/quantity data live, and are just as fast to build |
| Vehicles & their availability (return-trip capacity) | 🟡 Static seed data | Real vehicle-operator onboarding is a separate product surface — out of scope this week |
| Bundling + Compatibility Engine | ✅ Real | Rule-based compatibility matrix (hand-curated for ~15–20 crops) + LLM-generated plain-language explanation of the score |
| Route optimization (pickup order) | ✅ Real, small scale | 5–8 node VRP via OR-Tools (or a clean greedy/2-opt heuristic if OR-Tools setup risks time) |
| Fair-price calculation | ✅ Real | Formula: distance × per-km rate + base fee + route-deviation penalty |
| Cost split across bundled farmers | ✅ Real | Shapley-value-based split (trivial to compute for ≤5 farmers) — a genuinely defensible "fair" claim |
| Driver bidding | 🟡 **Simulated** offers around the fair-price band (rule-based variation), not a live real-time bidding/notification system | Live auction infra (timers, race conditions, push notifications) is its own product — simulate 3–4 offers, keep the "not lowest-price-wins, price+reliability recommendation" logic real |
| Payments | ❌ Out of scope | UI shows COD/Digital toggle only, no real gateway |
| 12AM–3AM fraud window / admin manual override | ✅ Real (simplified) | Cheap, demonstrates system maturity |
| Admin dashboard | ✅ Real (Next.js web) | Orders, drivers, farmers, AI-confidence queue |

---

## 6. Non-Functional Notes

- **Explainability**: every AI decision (compatibility score, bundle formation, fair-price range)
  must show a human-readable "why," not just a number — this is your strongest differentiator.
- **Graceful degradation**: if compatibility fails or capacity doesn't fit, define the fallback
  now — split into a second sub-bundle, or queue for the next matching window. Don't leave this
  undefined; judges will ask.
- **No dataset collection risk**: all produce-compatibility and cost-model data is hand-curated or
  formula-based, not scraped/cleaned — this is what keeps the week feasible.

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Farmer + Driver mobile app | **React Native** (built in Android Studio) |
| Navigation | React Navigation — Bottom Tabs + Stack (see §9) |
| Backend API | FastAPI (Python) |
| Optimization engine | Python + OR-Tools (bundling/route), custom Shapley-split function |
| LLM tasks | NLU extraction from transcript, compatibility explanation, admin-facing summaries |
| Localization | `react-i18next` with per-language JSON template files (ta, te, ml, hi, en) |
| Voice input | `@react-native-voice/voice` (on-device speech-to-text) |
| Database/Auth/Storage | Supabase (Postgres, Auth, Realtime for order status) |
| Admin dashboard | Next.js (web) |
| Maps/route visualization | Static map (react-native-maps) with plotted pickup order; no live traffic API needed |

---

## 8. Out of Scope (Say This Explicitly in the Pitch)

Telephony/IVR call-in, real payment gateway integration, live multi-driver real-time bidding
infrastructure, real vehicle-operator onboarding flow, driver rating history (no historical data
in a week), cold-chain/sensor hardware. State these as "designed for, not built this week" —
this shows scope discipline rather than looking like gaps you missed.

---

# 9. App Structure & Tab Navigation (React Native)

Single React Native codebase, **role selected at login/signup** (Farmer or Driver), which
determines which bottom-tab navigator loads. This avoids building two separate apps in a week.

```
App
 ├─ Auth Stack (Login/Signup + Language Selection for farmers)
 │
 ├─ Farmer Tab Navigator (if role = farmer)
 │    ├─ 🏠 Home        → New order (text or mic input), quick "repeat last order"
 │    ├─ 📦 My Orders   → Active orders + status timeline + offer accept/reject screen
 │    ├─ 🔔 Offers      → Incoming fare offers for a pending order (fare, ETA, [Accept][Cancel])
 │    └─ 👤 Profile     → Language preference, past orders, payment method toggle
 │
 └─ Driver Tab Navigator (if role = driver)
      ├─ 🚚 Trips Feed  → Eligible bundled trips to bid on (capacity, route, pickups, [Bid])
      ├─ 📋 My Trips    → Assigned bundle: optimized pickup order, farmer/qty per stop, map
      ├─ 💰 Earnings    → Completed trips, per-trip earning breakdown
      └─ 👤 Profile     → Vehicle capacity, current load, availability toggle
```

### Screen-level detail per tab

**Farmer → Home**
- Toggle: Type order / Speak order (mic button, uses on-device STT in selected language)
- Live "AI understood" preview card (crop / qty / pickup / destination / date) before submit —
  mirrors the SMS-confirmation idea from the flow doc, shown in-app instead of via SMS
- Confidence badge (✅ auto-processed / ⚠️ sent for review) shown immediately

**Farmer → My Orders**
- Status timeline per order (Placed → Bundled → Bidding → Offer Received → Accepted →
  Pickup → Delivered → Paid), localized in the farmer's language
- Tapping an order in "Bidding"/"Offer Received" state deep-links to the Offers tab for that order

**Farmer → Offers**
- Fare card: vehicle type, capacity, fare, estimated pickup time, [Accept] [Cancel]
- No driver personal info shown pre-acceptance (per original spec)

**Farmer → Profile**
- Language selector (persisted, drives all templates app-wide)
- Order history, payment method preference (COD/Digital — UI only for MVP)

**Driver → Trips Feed**
- Card per eligible bundle: pickup count, total quantity, route distance, capacity fit, fair-price
  band, [Place Bid] input
- Filtered server-side by capacity/route/compatibility (per §5 matching engine) — driver never
  sees ineligible trips

**Driver → My Trips**
- Optimized pickup sequence (numbered stops on map), farmer name + crop + qty per stop,
  [Confirm Pickup] / [Mark Delivered] per stop
- Shows total vehicle utilization %

**Driver → Earnings**
- List of completed trips with per-farmer contribution to the fare (transparency both ways)

**Driver → Profile**
- Vehicle capacity, current load (auto-updated as trips are assigned), manual availability toggle

**Admin (Next.js, not RN — sidebar not tabs)**
- Live Orders, AI-Confidence Queue, Driver Management, Farmer Management, Manual
  Override actions — as specified in the original flow doc.

---

# 10. Phase-by-Phase Implementation Plan (7 Days, 6-Person Team)

### Suggested role split
- **P1 — Backend/DB Lead**: FastAPI structure, Supabase schema, auth, order lifecycle API
- **P2 — Optimization Engineer**: Bundling engine, compatibility matrix, route/VRP, Shapley split, fair-price formula
- **P3 — Farmer App Dev (RN)**: Farmer tab navigator + screens
- **P4 — Driver App Dev (RN)**: Driver tab navigator + screens
- **P5 — AI/Voice/i18n Engineer**: STT integration, LLM NLU extraction prompt, i18n template files, LLM explanation generator
- **P6 — Admin Dashboard + Integration/QA**: Next.js admin, end-to-end wiring, demo data seeding, demo script/pitch

### Day 1 — Foundations
- P1: Supabase schema (farmers, drivers, vehicles, orders, bundles, bids, offers) + auth
- P2: Define compatibility matrix (15–20 crops) + fair-price formula + Shapley-split function (pure Python, unit-tested)
- P3/P4: RN project scaffold in Android Studio, navigation skeleton (auth stack + both tab navigators), design tokens/theme
- P5: i18n file structure (5 languages) with placeholder templates for all message types listed in §5; spike `@react-native-voice/voice`
- P6: Next.js scaffold, seed script plan for static vehicles/routes/demo farmers

### Day 2 — Core Data Flow
- P1: Order CRUD API + status-lifecycle endpoint + Supabase Realtime wiring for status updates
- P2: Bundling algorithm v1 (capacity + location clustering) running on seeded static vehicle data
- P3: Farmer Home screen — text order input working end-to-end to backend
- P4: Driver Trips Feed screen — static/API-driven list rendering
- P5: LLM NLU extraction endpoint (transcript/text → structured JSON) + confidence scoring logic
- P6: Seed realistic static dataset: 8–10 villages, 4–6 vehicles/drivers, 1 destination market

### Day 3 — Voice + Matching
- P1: Bid/offer endpoints, order-reopen-on-driver-reject logic
- P2: Route/VRP for pickup ordering (5–8 nodes) + compatibility scoring wired into bundling
- P3: Farmer voice input (mic → STT → NLU preview card) end-to-end
- P4: Driver My Trips screen — optimized pickup sequence + map rendering
- P5: LLM compatibility-explanation generator ("why these crops can/can't share a trip")
- P6: Admin: live order list + AI-confidence queue view

### Day 4 — Marketplace + Pricing
- P1: Wire fair-price + Shapley split outputs into order/bid API responses
- P2: Simulated driver-offer generator (3–4 offers around fair-price band with rule-based variation)
- P3: Farmer Offers tab (accept/cancel flow) + My Orders status timeline
- P4: Driver bid-placement UI + Earnings tab (static/derived)
- P5: Full i18n wiring — every farmer-facing screen pulls from localized templates, language persists from Profile
- P6: Admin manual-override actions (approve/reject/reassign) wired to backend

### Day 5 — Integration
- All: End-to-end walkthrough — place order (voice, non-English) → bundled with 2–3 other seeded
  farmers → compatibility explanation shown → route computed → simulated offers appear → farmer
  accepts → driver sees optimized multi-stop trip → status progresses → admin dashboard reflects
  everything live
- P6 leads bug triage list; fix integration breaks as they surface

### Day 6 — Polish + Edge Cases
- Handle 12AM–3AM flagging (simplified: any order below confidence threshold OR a toggle for demo)
- Handle "driver rejects/cancels → order reopens" flow
- Handle "no compatible bundle found → falls back to solo trip or next window" — make sure this
  path is demonstrable, not just theoretical
- UI polish pass on both RN apps + admin dashboard
- Prepare 2–3 scripted demo scenarios (happy path, low-confidence voice order, incompatible-crop
  rejection with explanation, driver-reject-and-reassign)

### Day 7 — Demo Prep
- Full rehearsal of the demo script, timed
- One-pager / pitch deck: reiterate the #65 framing (logistics-optimisation root cause of
  post-harvest loss), the Shapley fair-split and explainable-compatibility differentiators, and
  an explicit "what's simulated vs. real, and why" slide — this pre-empts the obvious judge
  question and demonstrates deliberate scoping rather than incompleteness
- Buffer for last-minute fixes

---

## 11. Open Decisions to Lock Before Day 1

1. OR-Tools vs. a hand-rolled greedy/2-opt heuristic for routing — pick based on whichever P2 is
   faster to get demo-reliable with; OR-Tools is more impressive if time allows, heuristic is
   safer if it doesn't.
2. Exact confidence threshold for auto-process vs. admin-review (e.g. 80%) — needs a demo-friendly
   value that's easy to trigger both paths on stage.
3. Whether farmer/driver share one app (role-switch at login, as scoped above) or two separate RN
   projects — one app is recommended for a 6-person/1-week build to avoid duplicated navigation
   and auth work.

  