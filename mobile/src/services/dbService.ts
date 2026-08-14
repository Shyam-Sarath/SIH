/**
 * KrishiBundle Supabase Database Service
 *
 * Implements full CRUD operations for Farmers, Drivers, and Admins.
 * Configures real-time Supabase subscriptions and matching logic.
 * Automatically falls back to in-memory mocks if Supabase tables are unavailable.
 */

import { supabase } from './supabaseClient';
import { UserRole, Language } from '../types';
import { OrderState } from '../utils/orderStateMachine';
import { filterEligibleDrivers, DriverSnapshot, OrderRequest } from '../utils/driverMatchingEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Local Fallback State (Simulating DB data)
// ─────────────────────────────────────────────────────────────────────────────

let localOrders: any[] = [
  {
    id: 'KB1029', farmer_phone: '9876543210', farmer_name: 'Ramu S.',
    crop: 'Tomato', quantity: 25, destination: 'Koyambedu', date: '14 Aug',
    status: OrderState.ADMIN_REVIEW, confidence: 42,
    raw_transcript: 'தக்காளி பத்து கிலோ... நாளைக்கு... சந்தை...',
    bids: [], current_fare: undefined,
  },
  {
    id: 'KB1028', farmer_phone: '9876543220', farmer_name: 'Priya D.',
    crop: 'Banana', quantity: 40, destination: 'Erode Market', date: '14 Aug',
    status: OrderState.AWAITING_BIDS, confidence: 96,
    bids: [
      { id: 'bid-001', driver_phone: '9876541111', driver_name: 'Suresh Kumar', vehicle_type: 'Tata Ace', amount: 420, reliability: 92, isRecommended: false },
      { id: 'bid-002', driver_phone: '9876542222', driver_name: 'Ramesh Selvam', vehicle_type: 'AL Dost', amount: 380, reliability: 97, isRecommended: true },
      { id: 'bid-004', driver_phone: '9876543333', driver_name: 'Vijay Pandi', vehicle_type: 'Tata Ace', amount: 400, reliability: 89, isRecommended: false },
    ],
  },
];

let localUsers: any[] = [
  { phone: '9876543210', name: 'Ramu S.', role: 'farmer', language: 'ta' },
  { phone: '9876543220', name: 'Priya D.', role: 'farmer', language: 'ml' },
  { phone: '9876541111', name: 'Suresh Kumar', role: 'driver', language: 'en' },
];

let localTrips: any[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Realtime Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to realtime bid updates on an order.
 * Triggers callback when a driver inserts a new bid.
 */
export function subscribeToBids(orderId: string, onUpdate: (payload: any) => void) {
  return supabase
    .channel(`bids:order_id=eq.${orderId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bids', filter: `order_id=eq.${orderId}` },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
}

/**
 * Subscribe to realtime order updates (e.g. state transitions).
 */
export function subscribeToOrderStatus(orderId: string, onUpdate: (payload: any) => void) {
  return supabase
    .channel(`orders:id=eq.${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
}

// ─────────────────────────────────────────────────────────────────────────────
// Profiles
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertUserProfile(profile: {
  phone: string;
  name: string;
  role: UserRole;
  language: Language;
}) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        phone: profile.phone,
        name: profile.name,
        role: profile.role,
        language: profile.language,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'phone' })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase profiles fallback:', err);
    const existing = localUsers.find(u => u.phone === profile.phone);
    if (existing) {
      Object.assign(existing, profile);
      return existing;
    }
    const newUser = { ...profile, id: `user-${Date.now()}` };
    localUsers.push(newUser);
    return newUser;
  }
}

export async function getUserProfile(phone: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase getUserProfile fallback:', err);
    return localUsers.find(u => u.phone === phone) || null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

export async function createOrder(order: {
  farmerPhone: string;
  crop: string;
  quantity: number;
  destination: string;
  status: OrderState;
  fareOffer: number;
  rawTranscript?: string;
  confidence: number;
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        farmer_phone: order.farmerPhone,
        farmer_name: (await getUserProfile(order.farmerPhone))?.name || 'Farmer',
        crop: order.crop,
        quantity: order.quantity,
        destination: order.destination,
        status: order.status,
        fare_offer: order.fareOffer,
        raw_transcript: order.rawTranscript,
        confidence: order.confidence,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase createOrder fallback:', err);
    const newOrder = {
      id: `KB${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_phone: order.farmerPhone,
      farmer_name: localUsers.find(u => u.phone === order.farmerPhone)?.name || 'Farmer (Local)',
      crop: order.crop,
      quantity: order.quantity,
      destination: order.destination,
      status: order.status,
      fare_offer: order.fareOffer,
      raw_transcript: order.rawTranscript,
      confidence: order.confidence,
      date: 'Today',
      bids: [],
    };
    localOrders.unshift(newOrder);
    return newOrder;
  }
}

export async function fetchFarmerOrders(phone: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase fetchFarmerOrders fallback:', err);
    return localOrders.filter(o => o.farmer_phone === phone);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bids & Matching
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBidsForOrder(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('order_id', orderId)
      .order('amount', { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase fetchBidsForOrder fallback:', err);
    const order = localOrders.find(o => o.id === orderId);
    return order ? order.bids : [];
  }
}

export async function placeDriverBid(bid: {
  orderId: string;
  driverPhone: string;
  driverName: string;
  vehicleType: string;
  amount: number;
  reliability: number;
}) {
  try {
    const { data, error } = await supabase
      .from('bids')
      .insert({
        order_id: bid.orderId,
        driver_phone: bid.driverPhone,
        driver_name: bid.driverName,
        vehicle_type: bid.vehicleType,
        amount: bid.amount,
        reliability: bid.reliability,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase placeDriverBid fallback:', err);
    const order = localOrders.find(o => o.id === bid.orderId);
    if (order) {
      const newBid = {
        id: `bid-${Date.now()}`,
        driver_phone: bid.driverPhone,
        driver_name: bid.driverName,
        vehicle_type: bid.vehicleType,
        amount: bid.amount,
        reliability: bid.reliability,
        status: 'PENDING',
      };
      order.bids.push(newBid);
      order.status = OrderState.BID_RECEIVED;
      return newBid;
    }
    return null;
  }
}

/**
 * Real Workflow: Accepts a bid, rejects other bids, transitions status to DRIVER_ASSIGNED,
 * and inserts a row into the trips table.
 */
export async function acceptBidTransaction(orderId: string, bidId: string, driverPhone: string, fare: number) {
  try {
    // 1. Accept chosen bid
    await supabase.from('bids').update({ status: 'ACCEPTED' }).eq('id', bidId);

    // 2. Reject other bids
    await supabase.from('bids').update({ status: 'REJECTED' }).eq('order_id', orderId).neq('id', bidId);

    // 3. Update Order state
    const { data: orderData, error } = await supabase
      .from('orders')
      .update({
        status: OrderState.DRIVER_ASSIGNED,
        assigned_driver: driverPhone,
        current_fare: fare,
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    // 4. Create Trip stop sequence
    await supabase.from('trips').insert({
      driver_phone: driverPhone,
      order_id: orderId,
      status: 'ASSIGNED',
      pickup_sequence: 1,
    });

    return orderData?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase acceptBidTransaction fallback:', err);
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
      order.status = OrderState.DRIVER_ASSIGNED;
      order.assigned_driver = driverPhone;
      order.current_fare = fare;
      order.bids.forEach((b: any) => {
        b.status = b.id === bidId ? 'ACCEPTED' : 'REJECTED';
      });

      const newTrip = {
        id: `trip-${Date.now()}`,
        driver_phone: driverPhone,
        order_id: orderId,
        status: 'ASSIGNED',
        pickup_sequence: 1,
      };
      localTrips.push(newTrip);
      return order;
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver Feed matching
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchEligibleOrdersForDriver(driver: DriverSnapshot) {
  try {
    // Fetch all active orders waiting for bids
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', [OrderState.AWAITING_BIDS, OrderState.BID_RECEIVED]);

    if (error) throw error;

    // Map DB orders to matching engine inputs and filter
    const parsedOrders = (orders || []).map(o => ({
      id: o.id,
      farmer_phone: o.farmer_phone,
      farmer_name: o.farmer_name,
      crop: o.crop,
      quantity: o.quantity,
      destination: o.destination,
      fare_offer: o.fare_offer,
      status: o.status,
      confidence: o.confidence,
      pickup_lat: Number(o.pickup_lat),
      pickup_lng: Number(o.pickup_lng),
    }));

    const matched = parsedOrders.filter(o => {
      const orderReq: OrderRequest = {
        quantityKg: o.quantity,
        pickupLat: o.pickup_lat,
        pickupLng: o.pickup_lng,
        destinationLat: 13.0732, // Default
        destinationLng: 80.1979,
      };
      const match = filterEligibleDrivers([driver], orderReq);
      return match.length > 0;
    });

    return matched;
  } catch (err) {
    console.warn('[DBService] Supabase fetchEligibleOrdersForDriver fallback:', err);
    // Local matching filter
    return localOrders.filter(o => [OrderState.AWAITING_BIDS, OrderState.BID_RECEIVED].includes(o.status));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Trips Feed
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDriverTrips(driverPhone: string) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, orders(*)')
      .eq('driver_phone', driverPhone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase fetchDriverTrips fallback:', err);
    return localTrips.filter(t => t.driver_phone === driverPhone);
  }
}

export async function updateTripStatus(tripId: string, status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED') {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase updateTripStatus fallback:', err);
    const trip = localTrips.find(t => t.id === tripId);
    if (trip) {
      trip.status = status;
      return trip;
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Control Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllOrdersAdmin() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase fetchAllOrdersAdmin fallback:', err);
    return localOrders;
  }
}

export async function updateOrderStatusAdmin(orderId: string, newState: OrderState, extraData?: any) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newState,
        ...extraData,
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase updateOrderStatusAdmin fallback:', err);
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
      order.status = newState;
      if (extraData?.assigned_driver) order.assigned_driver = extraData.assigned_driver;
      if (extraData?.current_fare) order.current_fare = extraData.current_fare;
      return order;
    }
    return null;
  }
}

// Stats & analytical counters query for Admin Dashboard
export async function fetchAdminStats() {
  try {
    const [ordersRes, profilesRes] = await Promise.all([
      supabase.from('orders').select('status, fare_offer, current_fare'),
      supabase.from('profiles').select('role'),
    ]);

    const orders = ordersRes.data || [];
    const profiles = profilesRes.data || [];

    const activeOrders = orders.filter(o => o.status !== OrderState.COMPLETED && o.status !== OrderState.CANCELLED).length;
    const bidding = orders.filter(o => [OrderState.AWAITING_BIDS, OrderState.BID_RECEIVED, OrderState.OFFER_SENT].includes(o.status)).length;
    const completedToday = orders.filter(o => o.status === OrderState.COMPLETED).length;

    const drivers = profiles.filter(p => p.role === 'driver').length;
    const farmers = profiles.filter(p => p.role === 'farmer').length;

    const grossRevenue = orders
      .filter(o => o.status === OrderState.COMPLETED)
      .reduce((sum, o) => sum + Number(o.current_fare || o.fare_offer || 0), 0);

    return {
      activeOrders,
      bidding,
      completedToday,
      activeDrivers: drivers,
      totalFarmers: farmers,
      todayRevenue: grossRevenue,
      driverEarnings: grossRevenue * 0.9, // 90% goes to driver
      pendingReview: orders.filter(o => o.status === OrderState.ADMIN_REVIEW).length,
    };
  } catch (err) {
    console.warn('[DBService] Supabase fetchAdminStats fallback:', err);
    return {
      activeOrders: localOrders.length,
      bidding: localOrders.filter(o => o.status === OrderState.AWAITING_BIDS).length,
      completedToday: 4,
      activeDrivers: 24,
      totalFarmers: 140,
      todayRevenue: 2840,
      driverEarnings: 2556,
      pendingReview: localOrders.filter(o => o.status === OrderState.ADMIN_REVIEW).length,
    };
  }
}
