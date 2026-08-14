// Driver Trips Feed — eligible bundled trips to bid on
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const MOCK_TRIPS = [
  {
    id: 'bundle-001',
    pickups: 3,
    totalQuantity: 95,
    crops: ['Tomato 25kg', 'Onion 30kg', 'Carrot 40kg'],
    pickupArea: 'Kurichi → Vadavalli → Saravanampatty',
    destination: 'Koyambedu Market, Chennai',
    distanceKm: 32,
    fairPriceMin: 360,
    fairPriceMax: 420,
    capacityFit: 68,
    compatibilityScore: 94,
    compatibilityNote: '✅ All crops are compatible. Onion & tomato safe together at room temp.',
    timeWindow: '5:00 AM – 8:00 AM tomorrow',
  },
  {
    id: 'bundle-002',
    pickups: 2,
    totalQuantity: 70,
    crops: ['Banana 40kg', 'Mango 30kg'],
    pickupArea: 'Mettupalayam → Periyanaickenpalayam',
    destination: 'Erode Market',
    distanceKm: 21,
    fairPriceMin: 280,
    fairPriceMax: 340,
    capacityFit: 45,
    compatibilityScore: 88,
    compatibilityNote: '⚠️ Mango emits ethylene. Stored separately in vehicle. Compatible.',
    timeWindow: '4:00 AM – 7:00 AM tomorrow',
  },
];

export default function DriverFeedScreen() {
  const [bids, setBids] = useState<Record<string, string>>({});
  const [submittedBids, setSubmittedBids] = useState<Set<string>>(new Set());

  const handleBid = (bundleId: string) => {
    const bidAmount = bids[bundleId];
    if (!bidAmount || isNaN(Number(bidAmount))) {
      Alert.alert('Invalid', 'Enter a valid bid amount');
      return;
    }
    Alert.alert(
      '🤝 Place Bid?',
      `Your bid: ₹${bidAmount}\nSystem will notify you if the farmer accepts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Bid',
          onPress: () => {
            setSubmittedBids(s => new Set([...s, bundleId]));
            Alert.alert('✅ Bid Placed!', 'The farmer will review your offer shortly.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 Trips Feed</Text>
        <View style={styles.availableBadge}>
          <View style={styles.dot} />
          <Text style={styles.availableText}>Available</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          {MOCK_TRIPS.length} bundled trips match your vehicle capacity and route
        </Text>

        {MOCK_TRIPS.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            {/* Route */}
            <View style={styles.routeHeader}>
              <View style={styles.routeInfo}>
                <Ionicons name="location" size={16} color={Colors.farmerColor} />
                <Text style={styles.routeText}>{trip.pickupArea}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
              <View style={styles.routeInfo}>
                <Ionicons name="storefront" size={16} color={Colors.accent} />
                <Text style={styles.destText}>{trip.destination}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{trip.pickups}</Text>
                <Text style={styles.statLbl}>Pickups</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{trip.totalQuantity} kg</Text>
                <Text style={styles.statLbl}>Total Load</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{trip.distanceKm} km</Text>
                <Text style={styles.statLbl}>Distance</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: Colors.driverColor }]}>{trip.capacityFit}%</Text>
                <Text style={styles.statLbl}>Capacity</Text>
              </View>
            </View>

            {/* Crops */}
            <View style={styles.cropsBox}>
              {trip.crops.map((c, i) => (
                <View key={i} style={styles.cropChip}>
                  <Text style={styles.cropChipText}>🌿 {c}</Text>
                </View>
              ))}
            </View>

            {/* Compatibility */}
            <View style={styles.compatBox}>
              <View style={styles.compatHeader}>
                <Text style={styles.compatTitle}>Cargo Compatibility</Text>
                <View style={[styles.compatBadge, { backgroundColor: trip.compatibilityScore >= 90 ? Colors.success + '25' : Colors.warning + '25' }]}>
                  <Text style={[styles.compatScore, { color: trip.compatibilityScore >= 90 ? Colors.success : Colors.warning }]}>
                    {trip.compatibilityScore}%
                  </Text>
                </View>
              </View>
              <Text style={styles.compatNote}>{trip.compatibilityNote}</Text>
            </View>

            {/* Fair price */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Fair Price Band</Text>
              <Text style={styles.priceValue}>₹{trip.fairPriceMin} – ₹{trip.fairPriceMax}</Text>
            </View>

            <Text style={styles.timeWindow}>⏰ {trip.timeWindow}</Text>

            {/* Bid input */}
            {submittedBids.has(trip.id) ? (
              <View style={styles.bidSubmitted}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.bidSubmittedText}>Bid placed: ₹{bids[trip.id]}</Text>
              </View>
            ) : (
              <View style={styles.bidRow}>
                <View style={styles.bidInput}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.bidTextInput}
                    value={bids[trip.id] || ''}
                    onChangeText={v => setBids(b => ({ ...b, [trip.id]: v }))}
                    keyboardType="numeric"
                    placeholder={`${trip.fairPriceMin} – ${trip.fairPriceMax}`}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <TouchableOpacity style={styles.bidBtn} onPress={() => handleBid(trip.id)}>
                  <Text style={styles.bidBtnText}>Place Bid</Text>
                </TouchableOpacity>
              </View>
            )}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.success + '40' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  availableText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  tripCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md, ...Shadow.sm,
  },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md, flexWrap: 'wrap' },
  routeInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  routeText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  destText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, padding: Spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cropsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  cropChip: { backgroundColor: Colors.primary + '20', borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.primary + '40' },
  cropChipText: { fontSize: FontSize.xs, color: Colors.farmerColor },
  compatBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  compatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  compatTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  compatBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: BorderRadius.full },
  compatScore: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  compatNote: { fontSize: FontSize.xs, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  priceValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.accent },
  timeWindow: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  bidRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  bidInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, paddingHorizontal: Spacing.md, height: 46,
  },
  rupeeSign: { fontSize: FontSize.lg, color: Colors.textPrimary, marginRight: 4 },
  bidTextInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  bidBtn: { backgroundColor: Colors.driverColor, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 46, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  bidBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  bidSubmitted: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.success + '15', borderRadius: BorderRadius.md, padding: Spacing.md },
  bidSubmittedText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.success },
});
