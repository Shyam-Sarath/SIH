// Farmer Orders Screen — status timeline
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { OrderStatus } from '../../types';

const MOCK_ORDERS = [
  {
    id: 'KB1024',
    crop: 'Tomato',
    quantity: 25,
    destination: 'Koyambedu Market',
    status: 'BIDDING' as OrderStatus,
    date: '14 Aug 2026',
    fareOffer: 380,
  },
  {
    id: 'KB1021',
    crop: 'Onion',
    quantity: 50,
    destination: 'Koyambedu Market',
    status: 'IN_TRANSIT' as OrderStatus,
    date: '13 Aug 2026',
    fareOffer: 520,
  },
  {
    id: 'KB1018',
    crop: 'Potato',
    quantity: 40,
    destination: 'Broadway Market',
    status: 'COMPLETED' as OrderStatus,
    date: '11 Aug 2026',
    fareOffer: 450,
  },
];

const STATUS_STEPS: OrderStatus[] = [
  'PLACED', 'VALIDATED', 'BUNDLING', 'BIDDING',
  'ACCEPTED', 'DRIVER_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED',
];

const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  VALIDATED: 'AI Validated',
  BUNDLING: 'Bundling',
  BIDDING: 'Drivers Bidding',
  OFFER_RECEIVED: 'Offer Received',
  ACCEPTED: 'Offer Accepted',
  DRIVER_ASSIGNED: 'Driver Assigned',
  PICKUP: 'Pickup Done',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
};

const STATUS_COLOR: Record<string, string> = {
  PLACED: Colors.info,
  VALIDATED: Colors.success,
  BUNDLING: Colors.primaryLight,
  BIDDING: Colors.accent,
  OFFER_RECEIVED: Colors.accent,
  ACCEPTED: Colors.success,
  DRIVER_ASSIGNED: Colors.success,
  PICKUP: Colors.driverColor,
  IN_TRANSIT: Colors.driverColor,
  DELIVERED: Colors.success,
  COMPLETED: Colors.success,
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] || Colors.textMuted;
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '22', borderColor: color + '50' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[status] || status}</Text>
    </View>
  );
}

export default function FarmerOrdersScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 My Orders</Text>
        <Text style={styles.headerSub}>{MOCK_ORDERS.length} orders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {MOCK_ORDERS.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderId}>#{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cropRow}>
                <Text style={styles.cropEmoji}>🌿</Text>
                <Text style={styles.cropName}>{order.crop}</Text>
                <Text style={styles.cropQty}>{order.quantity} kg</Text>
              </View>
              <View style={styles.destRow}>
                <Ionicons name="location" size={16} color={Colors.textMuted} />
                <Text style={styles.destText}>{order.destination}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.fareContainer}>
                <Text style={styles.fareLabel}>Fare</Text>
                <Text style={styles.fareValue}>₹{order.fareOffer}</Text>
              </View>
              {order.status === 'BIDDING' && (
                <TouchableOpacity style={styles.viewOffersBtn}>
                  <Text style={styles.viewOffersBtnText}>View Offers</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.farmerColor} />
                </TouchableOpacity>
              )}
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {STATUS_STEPS.slice(0, 6).map((step, i) => {
                const currentIdx = STATUS_STEPS.indexOf(order.status);
                const isDone = i <= currentIdx;
                return (
                  <View key={step} style={styles.timelineStep}>
                    <View style={[styles.timelineDot, isDone && styles.timelineDotDone]} />
                    {i < 5 && <View style={[styles.timelineLine, isDone && i < currentIdx && styles.timelineLineDone]} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
  orderCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardBody: { gap: 8, marginBottom: Spacing.md },
  cropRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cropEmoji: { fontSize: 20 },
  cropName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  cropQty: { fontSize: FontSize.md, color: Colors.farmerColor, fontWeight: FontWeight.bold },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  destText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder },
  fareContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fareLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  fareValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.accent },
  viewOffersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewOffersBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.farmerColor },
  timeline: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  timelineStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.surfaceBorder, borderWidth: 2, borderColor: Colors.surfaceBorder },
  timelineDotDone: { backgroundColor: Colors.farmerColor, borderColor: Colors.farmerColor },
  timelineLine: { flex: 1, height: 2, backgroundColor: Colors.surfaceBorder },
  timelineLineDone: { backgroundColor: Colors.farmerColor },
});
