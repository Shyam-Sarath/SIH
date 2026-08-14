# KrishiBundle — Development Progress Report

This document tracks the current status of the KrishiBundle mobile application, core business logic engines, testing suite, and CI/CD pipelines.

---

## 🏗️ 1. Project Architecture & Setup
- **Monorepo Repository:** Hosted at [github.com/Shyam-Sarath/SIH](https://github.com/Shyam-Sarath/SIH)
- **Framework:** Expo (React Native) managed workflow.
- **Styling & Tokens:** Clean, high-fidelity UI system implemented in [theme/index.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/theme/index.ts) with custom dark mode tokens (`Colors.background`, `Colors.surfaceElevated`, `Colors.primary`, etc.).
- **Global Interfaces:** Unified TypeScript models defined in [types/index.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/types/index.ts) (Order, User, Bid, Bundle, Language, UserRole).
- **Authentication Store:** [AuthContext.tsx](file:///d:/KRISHI%20BUNDLE/mobile/src/store/AuthContext.tsx) manages login, Signup, role selection, and language persistence via `AsyncStorage`.

---

## 📱 2. Screen & Navigation Matrix (13 Screens)
We have implemented a unified app architecture where logging in dynamically routes to the appropriate navigation tree:

```
RootNavigator
 ├─ AuthNavigator (Role Selection → Login → Signup)
 ├─ FarmerNavigator (Bottom Tab: Home → Orders → Offers → Profile)
 ├─ DriverNavigator (Bottom Tab: Trips Feed → My Trips → Earnings → Profile)
 └─ AdminNavigator (Bottom Tab: Dashboard → Orders → Drivers → Farmers)
```

### Auth Stack
1. **[RoleSelectScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/auth/RoleSelectScreen.tsx):** High-fidelity selection card animations for Farmer, Driver, and Admin.
2. **[LoginScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/auth/LoginScreen.tsx):** OTP authentication flow (demo mock code `1234`).
3. **[SignupScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/auth/SignupScreen.tsx):** Basic phone and role registration.

### Farmer Stack
4. **[FarmerHomeScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/farmer/FarmerHomeScreen.tsx):** Voice (speech-to-text) and manual crop order entry with AI confidence indicators.
5. **[FarmerOrdersScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/farmer/FarmerOrdersScreen.tsx):** Order history featuring an interactive visual status timeline.
6. **[FarmerOffersScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/farmer/FarmerOffersScreen.tsx):** Accept/Reject driver bids, fair-price range indicators, and cargo bundling info.
7. **[FarmerProfileScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/farmer/FarmerProfileScreen.tsx):** Multilingual preference selection, payment options (COD toggle), and profile details.

### Driver Stack
8. **[DriverFeedScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/driver/DriverFeedScreen.tsx):** Trip listings with crop compatibility warnings and bidding entry within fair bands.
9. **[DriverTripsScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/driver/DriverTripsScreen.tsx):** Active trip tracker with optimized stop sequences and pickup confirmation buttons.
10. **[DriverEarningsScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/driver/DriverEarningsScreen.tsx):** Monthly gross/net summaries and per-farmer Shapley value fare breakdowns.
11. **[DriverProfileScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/driver/DriverProfileScreen.tsx):** Availability status switch and real-time vehicle capacity load bar.

### Admin Stack (Power Human-in-the-Loop)
12. **[AdminDashboardScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/admin/AdminDashboardScreen.tsx):** System overview stats (Revenue, active trips, orders) and live AI voice transcripts verification queue.
13. **[AdminOrdersScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/admin/AdminOrdersScreen.tsx):** **Human-in-the-loop manual override** control panel for force-assigning drivers, overriding fares, selecting bids, and handling low AI confidence issues.
14. **[AdminDriversScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/admin/AdminDriversScreen.tsx) & [AdminFarmersScreen](file:///d:/KRISHI%20BUNDLE/mobile/src/screens/admin/AdminFarmersScreen.tsx):** Live data feeds containing utilization rates, languages, and contact buttons.

---

## ⚙️ 3. Core Business & Logic Engines

### 🔄 Order State Machine — [orderStateMachine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/orderStateMachine.ts)
- Strictly controls allowed transitions through **12 happy-path states** and **5 exceptional states** (`AI_LOW_CONFIDENCE`, `CANCELLED`, `DRIVER_REJECTED`, `PAYMENT_FAILED`, `ADMIN_OVERRIDE`).
- Prevents invalid transitions (e.g. `CREATED` -> `IN_TRANSIT` throws a type-safe `OrderStateMachineError`).

### 🧠 Cargo Compatibility Engine — [compatibilityEngine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/compatibilityEngine.ts)
- Deterministic rules-first validation of 15 crop profiles.
- Validates temperature boundaries, ethylene producers vs. sensitive crops, odour transfer, humidity conflicts, and delicate items.
- The LLM is used **exclusively** to format these deterministic rule results into human-friendly explanations.

### 🚚 Driver Matching Engine — [driverMatchingEngine.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/utils/driverMatchingEngine.ts)
- Dynamic route proximity calculator using the Haversine formula (15km radius check).
- Capacity validation incorporating a **95% safety buffer** to protect drivers from overloading.

---

## 🌐 4. Multilingual & Notification Architecture

### i18n Support — [locales/](file:///d:/KRISHI%20BUNDLE/mobile/src/i18n/locales/)
- Translation JSON catalogs created for **English (en)**, **Tamil (ta)**, **Telugu (te)**, **Malayalam (ml)**, and **Hindi (hi)**.
- Covers all order statuses and automated message configurations.
- Lang preference (`farmer.language`) persists on the user record so that all transaction-related SMS or push alerts maintain their local preference throughout the order lifecycle.

### Notification Service — [NotificationService.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/services/NotificationService.ts)
- Fully typed event-driven push notifier integrated using `expo-notifications`.
- Resolves the correct language resource dynamically based on target user settings before dispatching push notifications.

---

## 🧪 5. Testing & CI/CD Pipeline
- **Automated Tests:** **38 Jest unit tests** fully verified and passing in [businessLogic.test.ts](file:///d:/KRISHI%20BUNDLE/mobile/src/__tests__/businessLogic.test.ts). Checks capacity exclusion, route limits, state machine rules, and cargo pairings.
- **CI Workflow:** [mobile-ci.yml](file:///d:/KRISHI%20BUNDLE/.github/workflows/mobile-ci.yml) triggers on every push and pull request to test TypeScript types, linter flags, Jest logic tests, and EAS APK builds.

---

## 🚀 6. Dev Server Status
- The Metro Bundler dev server is active and running in the background on port `8081`.
