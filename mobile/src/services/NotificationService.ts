/**
 * KrishiBundle Notification Service
 *
 * Architecture:
 * - Push notifications via expo-notifications
 * - Every notification is routed through the farmer's language preference
 * - The service translates the notification body using the correct i18n locale
 * - Drivers and Admins receive English notifications
 *
 * Event-driven: callers pass a NotificationEvent, the service
 * determines WHO gets notified and in WHAT LANGUAGE automatically.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import i18n from '../i18n';
import { Language } from '../types';
import { OrderState } from '../utils/orderStateMachine';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationEvent =
  | { type: 'ORDER_CREATED';       orderId: string; farmerLanguage: Language }
  | { type: 'ORDER_PROCESSING';    orderId: string; farmerLanguage: Language }
  | { type: 'AWAITING_BIDS';       orderId: string; crop: string; quantity: number; farmerLanguage: Language }
  | { type: 'BID_RECEIVED';        orderId: string; farmerLanguage: Language }
  | { type: 'OFFER_RECEIVED';      orderId: string; fare: number; vehicleType: string; eta: string; farmerLanguage: Language }
  | { type: 'ORDER_ACCEPTED';      orderId: string; farmerLanguage: Language }
  | { type: 'DRIVER_ASSIGNED';     orderId: string; driverName: string; crop: string; eta: string; farmerLanguage: Language }
  | { type: 'PICKUP_DONE';         orderId: string; crop: string; quantity: number; farmerLanguage: Language }
  | { type: 'IN_TRANSIT';          orderId: string; destination: string; farmerLanguage: Language }
  | { type: 'DELIVERED';           orderId: string; crop: string; destination: string; farmerLanguage: Language }
  | { type: 'ORDER_COMPLETED';     orderId: string; farmerLanguage: Language }
  | { type: 'ORDER_CANCELLED';     orderId: string; farmerLanguage: Language }
  | { type: 'DRIVER_REJECTED';     orderId: string; farmerLanguage: Language }
  | { type: 'ADMIN_REVIEW_NEEDED'; orderId: string; confidence: number }          // Admin EN only
  | { type: 'NEW_TRIP_AVAILABLE';  bundleId: string; pickups: number; fare: number }  // Driver EN only
  | { type: 'BID_ACCEPTED';        bundleId: string; driverName: string }         // Driver EN only
  | { type: 'BID_REJECTED';        bundleId: string }                             // Driver EN only
  | { type: 'PAYMENT_FAILED';      orderId: string; farmerLanguage: Language };

// ─────────────────────────────────────────────────────────────────────────────
// Permission Registration
// ─────────────────────────────────────────────────────────────────────────────

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications only work on physical devices.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('krishibundle', {
      name: 'KrishiBundle',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#52B788',
      sound: 'default',
    });
  }

  // For production: use EAS project ID to get real push token
  // const token = await Notifications.getExpoPushTokenAsync({ projectId: '...' });
  // return token.data;

  return 'expo-push-token-placeholder';
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Get localized notification content
// ─────────────────────────────────────────────────────────────────────────────

function getLocalizedContent(
  key: string,
  lang: Language,
  params: Record<string, string | number> = {},
): { title: string; body: string } {
  // Temporarily switch i18n language to farmer's preference
  const currentLang = i18n.language;
  i18n.changeLanguage(lang);

  const body = i18n.t(key, params as any);

  // Restore language (UI language may differ from notification language)
  i18n.changeLanguage(currentLang);

  return {
    title: 'KrishiBundle 🌾',
    body,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Send local notification
// ─────────────────────────────────────────────────────────────────────────────

async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {}, sound: 'default' },
    trigger: null, // immediately
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatch — caller fires an event, service handles routing + translation
// ─────────────────────────────────────────────────────────────────────────────

export async function dispatchNotification(event: NotificationEvent): Promise<void> {
  try {
    switch (event.type) {
      // ── Farmer notifications (localized) ──────────────────────────────────

      case 'ORDER_CREATED': {
        const { title, body } = getLocalizedContent(
          'orderCreated', event.farmerLanguage, { orderId: event.orderId }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'AWAITING_BIDS': {
        const { title, body } = getLocalizedContent(
          'awaitingBids', event.farmerLanguage,
          { crop: event.crop, quantity: event.quantity }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'BID_RECEIVED': {
        const { title, body } = getLocalizedContent('bidReceived', event.farmerLanguage);
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'Offers' });
        break;
      }
      case 'OFFER_RECEIVED': {
        const { title, body } = getLocalizedContent(
          'offerReceived', event.farmerLanguage,
          { fare: event.fare, vehicleType: event.vehicleType, eta: event.eta }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'Offers' });
        break;
      }
      case 'ORDER_ACCEPTED': {
        const { title, body } = getLocalizedContent('orderAccepted', event.farmerLanguage);
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'DRIVER_ASSIGNED': {
        const { title, body } = getLocalizedContent(
          'driverAssigned', event.farmerLanguage,
          { driverName: event.driverName, crop: event.crop, eta: event.eta }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'PICKUP_DONE': {
        const { title, body } = getLocalizedContent(
          'pickupDone', event.farmerLanguage,
          { crop: event.crop, quantity: event.quantity }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'IN_TRANSIT': {
        const { title, body } = getLocalizedContent(
          'inTransit', event.farmerLanguage, { destination: event.destination }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'DELIVERED': {
        const { title, body } = getLocalizedContent(
          'delivered', event.farmerLanguage,
          { crop: event.crop, destination: event.destination }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'ORDER_COMPLETED': {
        const { title, body } = getLocalizedContent(
          'completed', event.farmerLanguage, { orderId: event.orderId }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'ORDER_CANCELLED': {
        const { title, body } = getLocalizedContent(
          'cancelled', event.farmerLanguage, { orderId: event.orderId }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'DRIVER_REJECTED': {
        const { title, body } = getLocalizedContent('driverRejected', event.farmerLanguage);
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }
      case 'PAYMENT_FAILED': {
        const { title, body } = getLocalizedContent(
          'paymentFailed', event.farmerLanguage, { orderId: event.orderId }
        );
        await sendLocalNotification(title, body, { orderId: event.orderId, screen: 'MyOrders' });
        break;
      }

      // ── Driver notifications (English) ────────────────────────────────────

      case 'NEW_TRIP_AVAILABLE': {
        await sendLocalNotification(
          'KrishiBundle — New Trip 🚚',
          `New bundled trip available! ${event.pickups} pickups, fare up to ₹${event.fare}. Bid now!`,
          { bundleId: event.bundleId, screen: 'TripsFeed' },
        );
        break;
      }
      case 'BID_ACCEPTED': {
        await sendLocalNotification(
          'KrishiBundle — Bid Accepted ✅',
          `Your bid was accepted! Check your assigned trips and prepare for pickup.`,
          { bundleId: event.bundleId, screen: 'MyTrips' },
        );
        break;
      }
      case 'BID_REJECTED': {
        await sendLocalNotification(
          'KrishiBundle — Offer Declined',
          `The farmer chose a different driver. Keep looking for more trips!`,
          { bundleId: event.bundleId, screen: 'TripsFeed' },
        );
        break;
      }

      // ── Admin notifications (English) ─────────────────────────────────────

      case 'ADMIN_REVIEW_NEEDED': {
        await sendLocalNotification(
          '⚠️ Admin Review Required',
          `Order #${event.orderId} has low AI confidence (${event.confidence}%). Manual review needed.`,
          { orderId: event.orderId, screen: 'AdminOrders' },
        );
        break;
      }

      default:
        console.warn('[NotificationService] Unknown event type:', (event as any).type);
    }
  } catch (err) {
    console.error('[NotificationService] Failed to dispatch notification:', err);
  }
}

/**
 * Helper — map order state transitions to the right notification event.
 * Backend calls this whenever it transitions an order state.
 */
export function notificationForStateTransition(
  orderId: string,
  newState: OrderState,
  context: {
    farmerLanguage: Language;
    crop?: string;
    quantity?: number;
    fare?: number;
    vehicleType?: string;
    driverName?: string;
    destination?: string;
    eta?: string;
    aiConfidence?: number;
  }
): NotificationEvent | null {
  const lang = context.farmerLanguage;

  switch (newState) {
    case OrderState.CREATED:         return { type: 'ORDER_CREATED', orderId, farmerLanguage: lang };
    case OrderState.AWAITING_BIDS:   return { type: 'AWAITING_BIDS', orderId, crop: context.crop ?? '', quantity: context.quantity ?? 0, farmerLanguage: lang };
    case OrderState.BID_RECEIVED:    return { type: 'BID_RECEIVED', orderId, farmerLanguage: lang };
    case OrderState.OFFER_SENT:      return { type: 'OFFER_RECEIVED', orderId, fare: context.fare ?? 0, vehicleType: context.vehicleType ?? '', eta: context.eta ?? '', farmerLanguage: lang };
    case OrderState.ACCEPTED:        return { type: 'ORDER_ACCEPTED', orderId, farmerLanguage: lang };
    case OrderState.DRIVER_ASSIGNED: return { type: 'DRIVER_ASSIGNED', orderId, driverName: context.driverName ?? '', crop: context.crop ?? '', eta: context.eta ?? '', farmerLanguage: lang };
    case OrderState.PICKUP:          return { type: 'PICKUP_DONE', orderId, crop: context.crop ?? '', quantity: context.quantity ?? 0, farmerLanguage: lang };
    case OrderState.IN_TRANSIT:      return { type: 'IN_TRANSIT', orderId, destination: context.destination ?? '', farmerLanguage: lang };
    case OrderState.DELIVERED:       return { type: 'DELIVERED', orderId, crop: context.crop ?? '', destination: context.destination ?? '', farmerLanguage: lang };
    case OrderState.COMPLETED:       return { type: 'ORDER_COMPLETED', orderId, farmerLanguage: lang };
    case OrderState.CANCELLED:       return { type: 'ORDER_CANCELLED', orderId, farmerLanguage: lang };
    case OrderState.DRIVER_REJECTED: return { type: 'DRIVER_REJECTED', orderId, farmerLanguage: lang };
    case OrderState.AI_LOW_CONFIDENCE:
    case OrderState.ADMIN_REVIEW:    return { type: 'ADMIN_REVIEW_NEEDED', orderId, confidence: context.aiConfidence ?? 0 };
    case OrderState.PAYMENT_FAILED:  return { type: 'PAYMENT_FAILED', orderId, farmerLanguage: lang };
    default:                         return null;
  }
}
