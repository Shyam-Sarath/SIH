// KrishiBundle — Type Definitions

export type UserRole = 'farmer' | 'driver' | 'admin';

export type Language = 'en' | 'ta' | 'te' | 'ml' | 'hi';

export type OrderStatus =
  | 'PLACED'
  | 'AI_PROCESSING'
  | 'ADMIN_REVIEW'
  | 'VALIDATED'
  | 'BUNDLING'
  | 'BIDDING'
  | 'OFFER_RECEIVED'
  | 'ACCEPTED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  language?: Language;
  createdAt: string;
}

export interface Farmer extends User {
  role: 'farmer';
  preferredLanguage: Language;
  totalOrders: number;
  totalSpent: number;
}

export interface Vehicle {
  id: string;
  type: string; // e.g. "Tata Ace", "Ashok Leyland"
  capacityKg: number;
  currentLoadKg: number;
  availableKg: number;
}

export interface Driver extends User {
  role: 'driver';
  vehicle: Vehicle;
  isAvailable: boolean;
  rating: number;
  totalTrips: number;
  completedTrips: number;
  totalEarnings: number;
  currentLocation?: { lat: number; lng: number };
}

export interface Order {
  id: string;
  farmerId: string;
  farmerName?: string;
  crop: string;
  quantityKg: number;
  pickupLocation: string;
  pickupCoords?: { lat: number; lng: number };
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  preferredDate: string;
  specialRequirements?: string;
  status: OrderStatus;
  aiConfidence?: number;
  aiTranscript?: string;
  language: Language;
  inputMethod: 'text' | 'voice';
  createdAt: string;
  updatedAt: string;
  bundleId?: string;
  offerId?: string;
  assignedDriverId?: string;
}

export interface Bundle {
  id: string;
  orders: Order[];
  totalQuantityKg: number;
  pickupSequence: { lat: number; lng: number; orderId: string; address: string }[];
  destination: string;
  fairPriceMin: number;
  fairPriceMax: number;
  compatibilityScore: number;
  compatibilityExplanation: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  bundleId: string;
  driverId: string;
  driverName?: string;
  vehicleType?: string;
  amount: number;
  estimatedPickupTime: string;
  reliabilityScore: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  orderId: string;
  bundleId: string;
  bid: Bid;
  recommendedFare: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface AdminStats {
  activeOrders: number;
  biddingOrders: number;
  inTransitOrders: number;
  deliveredToday: number;
  activeDrivers: number;
  totalFarmers: number;
  todayRevenue: number;
  driverEarnings: number;
  pendingAIReview: number;
}
