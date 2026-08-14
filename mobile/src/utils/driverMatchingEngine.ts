/**
 * KrishiBundle Driver Matching Engine
 *
 * Determines whether a driver is eligible to receive an order notification.
 * All rules are deterministic — no AI involved here.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverSnapshot {
  id: string;
  vehicleCapacityKg: number;
  currentLoadKg: number;
  locationLat: number;
  locationLng: number;
  isAvailable: boolean;
}

export interface OrderRequest {
  quantityKg: number;
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface MatchResult {
  eligible: boolean;
  reasons: string[];           // Why ineligible
  availableCapacityKg: number;
  distanceToPickupKm: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum km from driver's current location to farmer's pickup point */
export const MAX_ROUTE_DEVIATION_KM = 15;

/** Safety buffer — driver's load must not exceed this fraction of capacity */
export const CAPACITY_SAFETY_BUFFER = 0.95;

// ─────────────────────────────────────────────────────────────────────────────
// Haversine distance (km) between two lat/lng coordinates
// ─────────────────────────────────────────────────────────────────────────────

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────────────────
// Capacity Check
// ─────────────────────────────────────────────────────────────────────────────

export interface CapacityCheckResult {
  eligible: boolean;
  availableKg: number;
  reason?: string;
}

export function checkCapacity(
  driver: Pick<DriverSnapshot, 'vehicleCapacityKg' | 'currentLoadKg'>,
  orderQuantityKg: number,
): CapacityCheckResult {
  const safeCapacity = driver.vehicleCapacityKg * CAPACITY_SAFETY_BUFFER;
  const availableKg = safeCapacity - driver.currentLoadKg;

  if (availableKg < orderQuantityKg) {
    return {
      eligible: false,
      availableKg: Math.max(0, availableKg),
      reason:
        `Driver capacity insufficient. ` +
        `Available: ${availableKg.toFixed(0)} kg, ` +
        `Order needs: ${orderQuantityKg} kg.`,
    };
  }

  return { eligible: true, availableKg };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route / Proximity Check
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteCheckResult {
  eligible: boolean;
  distanceKm: number;
  reason?: string;
}

export function checkRoute(
  driver: Pick<DriverSnapshot, 'locationLat' | 'locationLng'>,
  pickupLat: number,
  pickupLng: number,
  maxDeviationKm = MAX_ROUTE_DEVIATION_KM,
): RouteCheckResult {
  const distanceKm = haversineKm(
    driver.locationLat, driver.locationLng,
    pickupLat, pickupLng,
  );

  if (distanceKm > maxDeviationKm) {
    return {
      eligible: false,
      distanceKm,
      reason:
        `Driver is ${distanceKm.toFixed(1)} km from pickup — ` +
        `exceeds max deviation of ${maxDeviationKm} km.`,
    };
  }

  return { eligible: true, distanceKm };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Driver Match
// ─────────────────────────────────────────────────────────────────────────────

export function matchDriver(
  driver: DriverSnapshot,
  order: OrderRequest,
  orderCrops: string[],
  driverCurrentCrops: string[],
): MatchResult {
  const reasons: string[] = [];

  // 1. Availability
  if (!driver.isAvailable) {
    reasons.push('Driver is marked as unavailable.');
  }

  // 2. Capacity
  const capacityCheck = checkCapacity(driver, order.quantityKg);
  if (!capacityCheck.eligible) {
    reasons.push(capacityCheck.reason!);
  }

  // 3. Route proximity
  const routeCheck = checkRoute(driver, order.pickupLat, order.pickupLng);
  if (!routeCheck.eligible) {
    reasons.push(routeCheck.reason!);
  }

  // 4. Cargo compatibility (import lazily to avoid circular deps)
  // Note: Compatibility check is done separately by the bundling engine
  // and can disqualify a driver before matchDriver is called.

  return {
    eligible: reasons.length === 0,
    reasons,
    availableCapacityKg: capacityCheck.availableKg,
    distanceToPickupKm: routeCheck.distanceKm,
  };
}

/**
 * Filter a list of drivers to only those eligible for an order.
 */
export function filterEligibleDrivers(
  drivers: DriverSnapshot[],
  order: OrderRequest,
  orderCrops: string[] = [],
  driverCropsMap: Record<string, string[]> = {},
): { driver: DriverSnapshot; matchResult: MatchResult }[] {
  return drivers
    .map(driver => ({
      driver,
      matchResult: matchDriver(
        driver,
        order,
        orderCrops,
        driverCropsMap[driver.id] ?? [],
      ),
    }))
    .filter(({ matchResult }) => matchResult.eligible);
}
