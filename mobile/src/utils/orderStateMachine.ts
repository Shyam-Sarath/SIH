/**
 * KrishiBundle Order State Machine
 *
 * Single source of truth for order status transitions.
 * No screen or service should set order.status directly —
 * they must go through this machine, which enforces valid transitions.
 */

// ─────────────────────────────────────────────────────────────────────────────
// States
// ─────────────────────────────────────────────────────────────────────────────

export enum OrderState {
  // Happy path
  CREATED            = 'CREATED',
  PROCESSING         = 'PROCESSING',        // AI extracting structured data
  AWAITING_BIDS      = 'AWAITING_BIDS',     // Eligible drivers notified
  BID_RECEIVED       = 'BID_RECEIVED',      // At least one bid in
  OFFER_SENT         = 'OFFER_SENT',        // Best offer presented to farmer
  ACCEPTED           = 'ACCEPTED',          // Farmer accepted offer
  DRIVER_ASSIGNED    = 'DRIVER_ASSIGNED',   // Driver confirmed
  PICKUP             = 'PICKUP',            // Driver at farmer location
  IN_TRANSIT         = 'IN_TRANSIT',        // Goods loaded, en route
  DELIVERED          = 'DELIVERED',         // Dropped at market
  COMPLETED          = 'COMPLETED',         // Payment done

  // Exceptional states
  AI_LOW_CONFIDENCE  = 'AI_LOW_CONFIDENCE', // Below threshold → admin queue
  ADMIN_REVIEW       = 'ADMIN_REVIEW',      // Human reviewing
  CANCELLED          = 'CANCELLED',         // Any party cancelled
  DRIVER_REJECTED    = 'DRIVER_REJECTED',   // Driver rejected → reopen bidding
  PAYMENT_FAILED     = 'PAYMENT_FAILED',    // Payment issue
  ADMIN_OVERRIDE     = 'ADMIN_OVERRIDE',    // Admin forced a state change
}

// ─────────────────────────────────────────────────────────────────────────────
// Valid Transitions Map
// ─────────────────────────────────────────────────────────────────────────────

/**
 * For each state, the set of states it is allowed to move into.
 * This is the contract. Anything not listed here is INVALID.
 */
export const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  [OrderState.CREATED]: [
    OrderState.PROCESSING,
    OrderState.CANCELLED,
  ],
  [OrderState.PROCESSING]: [
    OrderState.AWAITING_BIDS,        // High AI confidence
    OrderState.AI_LOW_CONFIDENCE,    // Low confidence → admin queue
    OrderState.CANCELLED,
  ],
  [OrderState.AI_LOW_CONFIDENCE]: [
    OrderState.ADMIN_REVIEW,         // Admin picks it up
    OrderState.CANCELLED,
  ],
  [OrderState.ADMIN_REVIEW]: [
    OrderState.AWAITING_BIDS,        // Admin approves & corrects
    OrderState.CANCELLED,            // Admin rejects spam
  ],
  [OrderState.AWAITING_BIDS]: [
    OrderState.BID_RECEIVED,
    OrderState.CANCELLED,
  ],
  [OrderState.BID_RECEIVED]: [
    OrderState.OFFER_SENT,
    OrderState.AWAITING_BIDS,        // All bids expired → re-notify
    OrderState.CANCELLED,
  ],
  [OrderState.OFFER_SENT]: [
    OrderState.ACCEPTED,             // Farmer accepts
    OrderState.AWAITING_BIDS,        // Farmer rejects → reopen bidding
    OrderState.CANCELLED,            // Farmer cancels
  ],
  [OrderState.ACCEPTED]: [
    OrderState.DRIVER_ASSIGNED,
    OrderState.CANCELLED,
  ],
  [OrderState.DRIVER_ASSIGNED]: [
    OrderState.PICKUP,
    OrderState.DRIVER_REJECTED,      // Driver cancels last minute
    OrderState.CANCELLED,
  ],
  [OrderState.DRIVER_REJECTED]: [
    OrderState.AWAITING_BIDS,        // Re-open bidding to other drivers
    OrderState.CANCELLED,
  ],
  [OrderState.PICKUP]: [
    OrderState.IN_TRANSIT,
    OrderState.CANCELLED,
  ],
  [OrderState.IN_TRANSIT]: [
    OrderState.DELIVERED,
    OrderState.CANCELLED,
  ],
  [OrderState.DELIVERED]: [
    OrderState.COMPLETED,
    OrderState.PAYMENT_FAILED,
  ],
  [OrderState.PAYMENT_FAILED]: [
    OrderState.COMPLETED,            // Resolved
    OrderState.CANCELLED,
  ],
  [OrderState.COMPLETED]: [],        // Terminal state — no further transitions
  [OrderState.CANCELLED]: [],        // Terminal state
  [OrderState.ADMIN_OVERRIDE]: [
    // After an admin override, anything is valid (admin has full power)
    ...Object.values(OrderState),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// State Machine Logic
// ─────────────────────────────────────────────────────────────────────────────

export class OrderStateMachineError extends Error {
  constructor(from: OrderState, to: OrderState) {
    super(
      `Invalid order transition: ${from} → ${to}. ` +
      `Allowed from ${from}: [${VALID_TRANSITIONS[from].join(', ')}]`
    );
    this.name = 'OrderStateMachineError';
  }
}

/**
 * Check whether a transition is valid without throwing.
 */
export function canTransition(from: OrderState, to: OrderState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Perform a transition. Throws OrderStateMachineError if invalid.
 * Returns the new state for convenience.
 */
export function transition(
  currentState: OrderState,
  newState: OrderState,
  isAdminOverride = false
): OrderState {
  // Admin override bypasses normal rules (but logs it)
  if (isAdminOverride) {
    console.warn(`[OrderStateMachine] Admin override: ${currentState} → ${newState}`);
    return OrderState.ADMIN_OVERRIDE; // We record the override, then the actual target
    // In practice: return newState and mark order.isAdminOverridden = true
  }

  if (!canTransition(currentState, newState)) {
    throw new OrderStateMachineError(currentState, newState);
  }

  return newState;
}

/**
 * Terminal states that cannot progress further.
 */
export const TERMINAL_STATES: OrderState[] = [
  OrderState.COMPLETED,
  OrderState.CANCELLED,
];

export function isTerminal(state: OrderState): boolean {
  return TERMINAL_STATES.includes(state);
}

/**
 * States that need human attention (show alert in admin dashboard).
 */
export const ATTENTION_STATES: OrderState[] = [
  OrderState.AI_LOW_CONFIDENCE,
  OrderState.ADMIN_REVIEW,
  OrderState.DRIVER_REJECTED,
  OrderState.PAYMENT_FAILED,
];

export function needsAttention(state: OrderState): boolean {
  return ATTENTION_STATES.includes(state);
}

/**
 * Human-readable labels for each state.
 */
export const STATE_LABELS: Record<OrderState, string> = {
  [OrderState.CREATED]:           'Order Placed',
  [OrderState.PROCESSING]:        'AI Processing',
  [OrderState.AWAITING_BIDS]:     'Finding Drivers',
  [OrderState.BID_RECEIVED]:      'Bids Received',
  [OrderState.OFFER_SENT]:        'Offer Sent to Farmer',
  [OrderState.ACCEPTED]:          'Offer Accepted',
  [OrderState.DRIVER_ASSIGNED]:   'Driver Assigned',
  [OrderState.PICKUP]:            'Pickup in Progress',
  [OrderState.IN_TRANSIT]:        'In Transit',
  [OrderState.DELIVERED]:         'Delivered',
  [OrderState.COMPLETED]:         'Completed',
  [OrderState.AI_LOW_CONFIDENCE]: 'Needs Verification',
  [OrderState.ADMIN_REVIEW]:      'Admin Review',
  [OrderState.CANCELLED]:         'Cancelled',
  [OrderState.DRIVER_REJECTED]:   'Driver Unavailable',
  [OrderState.PAYMENT_FAILED]:    'Payment Issue',
  [OrderState.ADMIN_OVERRIDE]:    'Admin Override',
};

/**
 * Ordered list of happy-path states for timeline display.
 */
export const HAPPY_PATH: OrderState[] = [
  OrderState.CREATED,
  OrderState.PROCESSING,
  OrderState.AWAITING_BIDS,
  OrderState.BID_RECEIVED,
  OrderState.OFFER_SENT,
  OrderState.ACCEPTED,
  OrderState.DRIVER_ASSIGNED,
  OrderState.PICKUP,
  OrderState.IN_TRANSIT,
  OrderState.DELIVERED,
  OrderState.COMPLETED,
];
