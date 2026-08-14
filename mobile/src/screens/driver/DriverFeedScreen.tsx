// Driver Trips Feed — live matching engine to bid on real orders
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { fetchEligibleOrdersForDriver, placeDriverBid } from '../../services/dbService';
import { useAuth } from '../../store/AuthContext';
import { checkCompatibility } from '../../utils/compatibilityEngine';

export default function DriverFeedScreen() {
  const { userName, userPhone } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Record<string, string>>({});
  const [submittedBids, setSubmittedBids] = useState<Set<string>>(new Set());

  // Hardcoded driver profile representation for the matching calculations
  const driverSnapshot = {
    id: userPhone || '9876541111',
    vehicleCapacityKg: 1000,
    currentLoadKg: 200,
    locationLat: 11.0168, // Coimbatore coordinates
    locationLng: 76.9558,
    isAvailable: true,
  };

  useEffect(() => {
    loadEligibleOrders();
  }, [userPhone]);

  const loadEligibleOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchEligibleOrdersForDriver(driverSnapshot);
      setOrders(data || []);
    } catch (e) {
      console.warn('Failed to load driver matching feed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = (orderId: string, fairPriceMin = 360) => {
    const bidAmount = bids[orderId];
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
          onPress: async () => {
            try {
              setLoading(true);
              await placeDriverBid({
                orderId,
                driverPhone: userPhone || '9876541111',
                driverName: userName || 'Driver Suresh',
                vehicleType: 'Tata Ace (1 Ton)',
                amount: Number(bidAmount),
                reliability: 96,
              });
              setSubmittedBids(s => new Set([...s, orderId]));
              Alert.alert('✅ Bid Placed!', 'The farmer will review your offer shortly.');
            } catch (err) {
              Alert.alert('Error', 'Failed to place bid.');
            } finally {
              setLoading(false);
              loadEligibleOrders();
            }
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
          <Text style={styles.availableText}>Active Load: {driverSnapshot.currentLoadKg}/1000 kg</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          {orders.length} real orders match your Tata Ace capacity and deviation limits
        </Text>

        {loading && orders.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.driverColor} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No matched orders nearby</Text>
            <Text style={styles.emptySub}>We will notify you when new crops are listed within 15 km.</Text>
          </View>
        ) : (
          orders.map(order => {
            const compat = checkCompatibility(order.crop, 'onion', 3); // check compatibility with current load crop
            const progress = (order.quantity / (1000 - driverSnapshot.currentLoadKg)) * 100;
            const deviationKm = 4.2; // Simulated matching radius calculation
            const fairPriceMin = 360;
            const fairPriceMax = 420;

            return (
              <View key={order.id} style={styles.tripCard}>
                {/* Route */}
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Ionicons name="location" size={16} color={Colors.farmerColor} />
                    <Text style={styles.routeText}>Coimbatore (Farmer {order.farmer_name})</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                  <View style={styles.routeInfo}>
                    <Ionicons name="storefront" size={16} color={Colors.accent} />
                    <Text style={styles.destText}>{order.destination}</Text>
                  </View>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{order.quantity} kg</Text>
                    <Text style={styles.statLbl}>Load</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{deviationKm} km</Text>
                    <Text style={styles.statLbl}>Deviation</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: Colors.driverColor }]}>{Math.round(progress)}%</Text>
                    <Text style={styles.statLbl}>Vol. Space</Text>
                  </View>
                </View>

                {/* Crops */}
                <View style={styles.cropsBox}>
                  <View style={styles.cropChip}>
                    <Text style={styles.cropChipText}>🌿 {order.crop} {order.quantity} kg</Text>
                  </View>
                </View>

                {/* Compatibility Warning (Rules-first calculation) */}
                <View style={styles.compatBox}>
                  <View style={styles.compatHeader}>
                    <Text style={styles.compatTitle}>Cargo Compatibility</Text>
                    <View style={[styles.compatBadge, { backgroundColor: compat.compatible ? Colors.success + '25' : Colors.error + '25' }]}>
                      <Text style={[styles.compatScore, { color: compat.compatible ? Colors.success : Colors.error }]}>
                        {compat.compatible ? 'Safe' : 'Conflict'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.compatNote}>
                    {compat.compatible 
                      ? `✅ Matches vehicle profile temp limits.` 
                      : `❌ Ethylene/Temp conflict: ${compat.reasons.join(', ')}`}
                  </Text>
                </View>

                {/* Fair price */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Suggested Bid Range</Text>
                  <Text style={styles.priceValue}>₹{fairPriceMin} – ₹{fairPriceMax}</Text>
                </View>

                {/* Bid input */}
                {submittedBids.has(order.id) ? (
                  <View style={styles.bidSubmitted}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.bidSubmittedText}>Bid Placed: ₹{bids[order.id]}</Text>
                  </View>
                ) : (
                  <View style={styles.bidRow}>
                    <View style={styles.bidInput}>
                      <Text style={styles.rupeeSign}>₹</Text>
                      <TextInput
                        style={styles.bidTextInput}
                        value={bids[order.id] || ''}
                        onChangeText={v => setBids(b => ({ ...b, [order.id]: v }))}
                        keyboardType="numeric"
                        placeholder={`${fairPriceMin} – ${fairPriceMax}`}
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                    <TouchableOpacity style={styles.bidBtn} onPress={() => handleBid(order.id, fairPriceMin)}>
                      <Text style={styles.bidBtnText}>Bid</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
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
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.driverColor + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.driverColor + '40' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.driverColor },
  availableText: { fontSize: FontSize.xs, color: Colors.driverColor, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 10 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
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
