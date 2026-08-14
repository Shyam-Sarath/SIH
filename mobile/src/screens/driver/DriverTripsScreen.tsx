// Driver My Trips — assigned trips with optimized pickup sequence
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const MOCK_ASSIGNED_TRIP = {
  bundleId: 'bundle-001',
  destination: 'Koyambedu Market, Chennai',
  totalQuantity: 95,
  totalFare: 380,
  utilizationPct: 68,
  stops: [
    {
      stopNo: 1,
      farmerName: 'Raju Kumar',
      crop: 'Tomato',
      quantityKg: 25,
      address: 'Kurichi Village, Coimbatore',
      coords: { lat: 10.9845, lng: 76.9523 },
      status: 'CONFIRMED' as const,
    },
    {
      stopNo: 2,
      farmerName: 'Suresh Murugan',
      crop: 'Onion',
      quantityKg: 30,
      address: 'Vadavalli, Coimbatore',
      coords: { lat: 10.9721, lng: 76.9328 },
      status: 'PENDING' as const,
    },
    {
      stopNo: 3,
      farmerName: 'Meena Selvi',
      crop: 'Carrot',
      quantityKg: 40,
      address: 'Saravanampatty, Coimbatore',
      coords: { lat: 11.0367, lng: 77.0281 },
      status: 'PENDING' as const,
    },
  ],
};

type StopStatus = 'CONFIRMED' | 'PENDING' | 'PICKED_UP';

export default function DriverTripsScreen() {
  const [stopStatuses, setStopStatuses] = useState<Record<number, StopStatus>>(
    Object.fromEntries(MOCK_ASSIGNED_TRIP.stops.map(s => [s.stopNo, s.status]))
  );

  const handlePickup = (stopNo: number) => {
    Alert.alert('Confirm Pickup', `Mark stop #${stopNo} as picked up?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Pickup',
        onPress: () => setStopStatuses(s => ({ ...s, [stopNo]: 'PICKED_UP' })),
      },
    ]);
  };

  const pickedUpCount = Object.values(stopStatuses).filter(s => s === 'PICKED_UP').length;
  const allPickedUp = pickedUpCount === MOCK_ASSIGNED_TRIP.stops.length;

  const getStopColor = (status: StopStatus) => {
    if (status === 'PICKED_UP') return Colors.success;
    if (status === 'CONFIRMED') return Colors.driverColor;
    return Colors.textMuted;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Trip</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{pickedUpCount}/{MOCK_ASSIGNED_TRIP.stops.length} pickups</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Trip summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{MOCK_ASSIGNED_TRIP.totalQuantity} kg</Text>
              <Text style={styles.summaryLbl}>Total Load</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>₹{MOCK_ASSIGNED_TRIP.totalFare}</Text>
              <Text style={styles.summaryLbl}>Your Earning</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Colors.driverColor }]}>{MOCK_ASSIGNED_TRIP.utilizationPct}%</Text>
              <Text style={styles.summaryLbl}>Utilized</Text>
            </View>
          </View>

          {/* Utilization bar */}
          <View style={styles.utilBar}>
            <View style={[styles.utilFill, { width: `${MOCK_ASSIGNED_TRIP.utilizationPct}%` }]} />
          </View>

          <View style={styles.destinationRow}>
            <Ionicons name="flag" size={16} color={Colors.accent} />
            <Text style={styles.destinationText}>{MOCK_ASSIGNED_TRIP.destination}</Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={Colors.textMuted} />
          <Text style={styles.mapText}>Optimized Route Map</Text>
          <Text style={styles.mapSub}>3 stops → Koyambedu</Text>
          <View style={styles.mapStops}>
            {MOCK_ASSIGNED_TRIP.stops.map(stop => (
              <View key={stop.stopNo} style={styles.mapStop}>
                <View style={[styles.mapStopDot, { backgroundColor: getStopColor(stopStatuses[stop.stopNo]) }]}>
                  <Text style={styles.mapStopNum}>{stop.stopNo}</Text>
                </View>
                {stop.stopNo < MOCK_ASSIGNED_TRIP.stops.length && (
                  <View style={styles.mapLine} />
                )}
              </View>
            ))}
            <View style={[styles.mapStopDot, { backgroundColor: Colors.accent }]}>
              <Ionicons name="storefront" size={10} color={Colors.textInverse} />
            </View>
          </View>
        </View>

        {/* Pickup stops */}
        <Text style={styles.stopsTitle}>Pickup Sequence</Text>
        {MOCK_ASSIGNED_TRIP.stops.map(stop => {
          const status = stopStatuses[stop.stopNo];
          const isPicked = status === 'PICKED_UP';
          return (
            <View key={stop.stopNo} style={[styles.stopCard, isPicked && styles.stopCardDone]}>
              <View style={styles.stopLeft}>
                <View style={[styles.stopNumber, { backgroundColor: getStopColor(status) + '30', borderColor: getStopColor(status) }]}>
                  <Text style={[styles.stopNumberText, { color: getStopColor(status) }]}>{stop.stopNo}</Text>
                </View>
                {stop.stopNo < MOCK_ASSIGNED_TRIP.stops.length && (
                  <View style={[styles.stopConnector, isPicked && styles.stopConnectorDone]} />
                )}
              </View>
              <View style={styles.stopContent}>
                <View style={styles.stopHeader}>
                  <Text style={styles.stopFarmer}>{stop.farmerName}</Text>
                  {isPicked ? (
                    <View style={styles.pickedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      <Text style={styles.pickedText}>Picked Up</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.stopCrop}>{stop.crop} — {stop.quantityKg} kg</Text>
                <View style={styles.stopAddressRow}>
                  <Ionicons name="location" size={14} color={Colors.textMuted} />
                  <Text style={styles.stopAddress}>{stop.address}</Text>
                </View>
                {!isPicked && (
                  <TouchableOpacity
                    style={styles.pickupBtn}
                    onPress={() => handlePickup(stop.stopNo)}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                    <Text style={styles.pickupBtnText}>Confirm Pickup</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* Mark delivered */}
        {allPickedUp && (
          <TouchableOpacity
            style={styles.deliveredBtn}
            onPress={() => Alert.alert('🎉 Trip Complete!', `₹${MOCK_ASSIGNED_TRIP.totalFare} has been credited to your account.`)}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.textInverse} />
            <Text style={styles.deliveredBtnText}>Mark All Delivered at Market</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  progressBadge: { backgroundColor: Colors.driverColor + '25', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.driverColor + '50' },
  progressText: { fontSize: FontSize.sm, color: Colors.driverColor, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  summaryLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  utilBar: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.md },
  utilFill: { height: '100%', backgroundColor: Colors.driverColor, borderRadius: 4 },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  destinationText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  mapPlaceholder: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    height: 160, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  mapText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  mapSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  mapStops: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  mapStop: { flexDirection: 'row', alignItems: 'center' },
  mapStopDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mapStopNum: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textInverse },
  mapLine: { width: 24, height: 2, backgroundColor: Colors.surfaceBorder },
  stopsTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  stopCard: {
    flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md,
  },
  stopCardDone: { opacity: 0.6 },
  stopLeft: { alignItems: 'center', width: 32 },
  stopNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  stopNumberText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stopConnector: { flex: 1, width: 2, backgroundColor: Colors.surfaceBorder, marginVertical: 4, minHeight: 40 },
  stopConnectorDone: { backgroundColor: Colors.success },
  stopContent: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stopFarmer: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pickedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickedText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  stopCrop: { fontSize: FontSize.sm, color: Colors.farmerColor, fontWeight: FontWeight.semibold, marginBottom: 4 },
  stopAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  stopAddress: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  pickupBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.driverColor, borderRadius: BorderRadius.sm, height: 36,
  },
  pickupBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },
  deliveredBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.success, borderRadius: BorderRadius.md, height: 54,
    marginTop: Spacing.md, ...Shadow.md,
  },
  deliveredBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
});
