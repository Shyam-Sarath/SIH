# KrishiBundle — Development Progress Report

This document tracks the current status of the KrishiBundle mobile application, detailing which modules are fully integrated and live, and which features currently run on mock data.

---

## 🏗️ 1. Project Architecture & Setup
- **Monorepo Repository:** Live at [github.com/Shyam-Sarath/SIH](https://github.com/Shyam-Sarath/SIH)
- **Framework:** Expo (React Native) managed workflow (Web + Mobile).
- **Styling & Tokens:** Clean, high-fidelity UI system implemented in [theme/index.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/theme/index.ts) with custom dark mode tokens (`Colors.background`, `Colors.surfaceElevated`, `Colors.primary`, etc.).
- **Global Interfaces:** Unified TypeScript models defined in [types/index.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/types/index.ts) (Order, User, Bid, Bundle, Language, UserRole).
- **Authentication Store:** [AuthContext.tsx](file:///d:/KRISHI%20BUNDLE/mobile/src/store/AuthContext.tsx) manages login, Signup, role selection, and language persistence via `AsyncStorage`.

---

## 📱 2. Screen & Navigation Matrix Integration Status

We have implemented a unified app navigation flow:

```
RootNavigator
 ├─ AuthNavigator (Role Selection → Login → Signup)
 ├─ FarmerNavigator (Bottom Tab: Home → Orders → Offers → Profile)
 ├─ DriverNavigator (Bottom Tab: Trips Feed → My Trips → Earnings → Profile)
 └─ AdminNavigator (Bottom Tab: Dashboard → Orders → Drivers → Farmers)
```

| Screen Name | Integration Status | Data Source | Details |
| :--- | :---: | :--- | :--- |
| **RoleSelectScreen** | **LIVE** | Local Storage | Persists the selected role dynamically |
| **LoginScreen** | **LIVE** | Supabase | Mocks authentication code `1234` then upserts standard profiles in Supabase |
| **SignupScreen** | **LIVE** | Supabase | Creates new profile records in Supabase |
| **FarmerHomeScreen** | **LIVE** | Groq & Supabase | Real Groq LLaMA text/voice parser + direct database inserts |
| **FarmerOrdersScreen**| **LIVE** | Supabase | Real-time query of logged-in farmer's active and historical orders |
| **FarmerOffersScreen**| **LIVE** | Supabase (Realtime) | Subscribes to live incoming driver bids and processes acceptance transactions |
| **FarmerProfileScreen**| **LIVE** | Supabase | Changes user language preferences dynamically in the remote DB |
| **DriverFeedScreen** | **LIVE** | Supabase | Pulls live orders and runs matching checks. Places real bids on Supabase |
| **DriverTripsScreen** | **LIVE** | Supabase | Shows assigned bookings. Mark pickup and delivery updates order state |
| **DriverEarningsScreen**| *MOCKED* | Static data arrays | Historical earnings and Shapley split valuations |
| **DriverProfileScreen**| *MOCKED* | Local state | Driver availability toggle and vehicle capacity display |
| **AdminDashboardScreen**| **LIVE** | Supabase | Calculates dynamic system statistics directly from database queries |
| **AdminOrdersScreen** | **LIVE** | Supabase | Queries orders + triggers remote state, price, or driver overrides |
| **AdminDriversScreen** | *MOCKED* | Static lists | Directory of registered drivers and vehicle loads |
| **AdminFarmersScreen** | *MOCKED* | Static lists | Directory of registered farmers and orders |

---

## ⚙️ 3. Core Business & Logic Engines

### 🔄 Order State Machine — [orderStateMachine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/orderStateMachine.ts) (100% WORKING)
- Controls all valid state transitions through **12 happy-path states** and **5 exceptional states** (`AI_LOW_CONFIDENCE`, `CANCELLED`, `DRIVER_REJECTED`, `PAYMENT_FAILED`, `ADMIN_OVERRIDE`).
- Prevents illegal status jumps (e.g. `CREATED` -> `IN_TRANSIT` throws a type-safe `OrderStateMachineError`).

### 🧠 Cargo Compatibility Engine — [compatibilityEngine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/compatibilityEngine.ts) (100% WORKING)
- Deterministic rules-first validation of 15 crop profiles (temp boundaries, ethylene, odour, humidity, delicacy).
- The LLM is used **exclusively** to format these deterministic rule results into human-friendly explanations.

### 🚚 Driver Matching Engine — [driverMatchingEngine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/driverMatchingEngine.ts) (100% WORKING)
- Proximity calculator using the Haversine formula (15km radius check).
- Capacity validation incorporating a **95% safety buffer** to protect drivers from overloading.

---

## 🌐 4. Multilingual & Notification Architecture

### i18n Support — [locales/](file:///d:/KRISHI%20BUNDLE/mobile/src/i18n/locales/) (100% WORKING)
- Translation JSON catalogs created for **English (en)**, **Tamil (ta)**, **Telugu (te)**, **Malayalam (ml)**, and **Hindi (hi)**.
- Lang preference (`farmer.language`) persists on the user record so that all transaction-related SMS or push alerts maintain local preference throughout the order lifecycle.

### Notification Service — [NotificationService.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/services/NotificationService.ts) (PARTIALLY WORKING)
- **Local Alerts:** Fully active. Local device notifications trigger dynamically based on order state changes.
- **Remote Push Broadcast:** Currently mocked. FCM/APNS server-side broadcasts will require server function setups.

---

## 🧪 5. Testing & CI/CD Pipeline
- **Automated Tests:** **38 Jest unit tests** fully verified and passing in [businessLogic.test.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/__tests__/businessLogic.test.ts). Checks capacity exclusion, route limits, state machine rules, and cargo pairings.
- **CI Workflow:** [mobile-ci.yml](file:///d:/KRISHI%20BUNDLE/.github/workflows/mobile-ci.yml) triggers on every push and pull request to test TypeScript types, linter flags, Jest logic tests, and EAS APK builds.
