/**
 * KrishiBundle Supabase Database Service
 *
 * Implements full CRUD operations for Farmers, Drivers, and Admins.
 * Contains automatic fallback to local memory state in case Supabase tables
 * do not exist or connection fails, ensuring the app remains fully functional.
 */

import { supabase } from './supabaseClient';
import { UserRole, OrderStatus, Language } from '../types';
import { OrderState } from '../utils/orderStateMachine';

// ─────────────────────────────────────────────────────────────────────────────
// Local Fallback State
// ─────────────────────────────────────────────────────────────────────────────

let localOrders: any[] = [
  {
    id: 'KB1029', farmer_name: 'Ramu S.', phone: '9876543210',
    crop: 'Tomato', quantity: 25, destination: 'Koyambedu', date: '14 Aug',
    status: OrderState.ADMIN_REVIEW, confidence: 42,
    transcript: 'தக்காளி பத்து கிலோ... நாளைக்கு... சந்தை...',
    bids: [], current_fare: undefined,
  },
  {
    id: 'KB1028', farmer_name: 'Priya D.', phone: '9876543220',
    crop: 'Banana', quantity: 40, destination: 'Erode Market', date: '14 Aug',
    status: OrderState.AWAITING_BIDS, confidence: 96,
    bids: [
      { id: 'bid-001', driverId: 'DRV001', driverName: 'Suresh Kumar', vehicle: 'Tata Ace', amount: 420, reliability: 92, isRecommended: false },
      { id: 'bid-002', driverId: 'DRV002', driverName: 'Ramesh Selvam', vehicle: 'AL Dost', amount: 380, reliability: 97, isRecommended: true },
      { id: 'bid-004', driverId: 'DRV004', driverName: 'Vijay Pandi', vehicle: 'Tata Ace', amount: 400, reliability: 89, isRecommended: false },
    ],
  },
  {
    id: 'KB1027', farmer_name: 'Suresh M.', phone: '9876543230',
    crop: 'Onion', quantity: 60, destination: 'Koyambedu', date: '14 Aug',
    status: OrderState.IN_TRANSIT, confidence: 91,
    bids: [], assigned_driver: 'Vijay Pandi', current_fare: 520,
  },
];

let localUsers: any[] = [];
let localBids: any[] = [];
let localTrips: any[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// User Profile Operations
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
    console.warn('[DBService] Supabase profiles failed, using local storage fallback:', err);
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
    console.warn('[DBService] Supabase getUserProfile failed, using local storage fallback:', err);
    return localUsers.find(u => u.phone === phone) || null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Operations
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
    console.warn('[DBService] Supabase createOrder failed, using local storage fallback:', err);
    const newOrder = {
      id: `KB${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_phone: order.farmerPhone,
      farmer_name: 'Farmer (Local)',
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
    console.warn('[DBService] Supabase fetchFarmerOrders failed, using local fallback:', err);
    return localOrders.filter(o => o.farmer_phone === phone || !o.farmer_phone);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bids & Offers
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBidsForOrder(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[DBService] Supabase fetchBidsForOrder failed, using local fallback:', err);
    const order = localOrders.find(o => o.id === orderId);
    return order ? order.bids : [];
  }
}

export async function placeDriverBid(bid: {
  orderId: string;
  driverId: string;
  driverName: string;
  vehicle: string;
  amount: number;
  reliability: number;
}) {
  try {
    const { data, error } = await supabase
      .from('bids')
      .insert({
        order_id: bid.orderId,
        driver_id: bid.driverId,
        amount: bid.amount,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('[DBService] Supabase placeDriverBid failed, using local fallback:', err);
    const order = localOrders.find(o => o.id === bid.orderId);
    if (order) {
      const newBid = {
        id: `bid-${Date.now()}`,
        driverId: bid.driverId,
        driverName: bid.driverName,
        vehicle: bid.vehicle,
        amount: bid.amount,
        reliability: bid.reliability,
        isRecommended: bid.amount < 400,
      };
      order.bids.push(newBid);
      order.status = OrderState.BID_RECEIVED;
      return newBid;
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
    console.warn('[DBService] Supabase fetchAllOrdersAdmin failed, using local fallback:', err);
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
    console.warn('[DBService] Supabase updateOrderStatusAdmin failed, using local fallback:', err);
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
