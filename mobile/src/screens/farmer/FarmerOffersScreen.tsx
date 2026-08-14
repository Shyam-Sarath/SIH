// Farmer Offers Screen — Accept/Reject incoming fare offers in real-time
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { fetchBidsForOrder, acceptBidTransaction, subscribeToBids } from '../../services/dbService';

export default function FarmerOffersScreen() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  
  // We use the last created order (or fallback order KB1028) for the offers view
  const orderId = 'KB1028'; 

  useEffect(() => {
    loadBids();

    // Set up Supabase Realtime listener to automatically load new bids
    const subscription = subscribeToBids(orderId, (newBid) => {
      setBids((prev) => {
        // Prevent duplicate push events
        if (prev.some(b => b.id === newBid.id)) return prev;
        return [...prev, newBid];
      });
      Alert.alert('🚚 New Bid Offer!', `New offer for ₹${newBid.amount} received from ${newBid.driver_name}!`);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadBids = async () => {
    setLoading(true);
    try {
      const data = await fetchBidsForOrder(orderId);
      setBids(data || []);
    } catch (e) {
      console.warn('Failed to load bids:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (bid: any) => {
    Alert.alert(
      '✅ Accept Offer?',
      `Fare: ₹${bid.amount}\nDriver: ${bid.driver_name}\nVehicle: ${bid.vehicle_type || 'Tata Ace'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Book',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await acceptBidTransaction(orderId, bid.id, bid.driver_phone, bid.amount);
              setAcceptedId(bid.id);
              Alert.alert('🎉 Order Booked!', 'Driver has been assigned. You will receive contact details shortly.');
            } catch (err) {
              Alert.alert('Error', 'Failed to confirm booking.');
            } finally {
              setLoading(false);
              loadBids();
            }
          },
        },
      ]
    );
  };

  const handleReject = (bidId: string) => {
    Alert.alert('Offer Rejected', 'Bid has been declined.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Offers</Text>
        <Text style={styles.headerSub}>{bids.length} offers for Order #{orderId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Fair price band info */}
        <View style={styles.fairPriceInfo}>
          <Ionicons name="information-circle" size={18} color={Colors.info} />
          <Text style={styles.fairPriceText}>
            Fair price range: <Text style={styles.fairPriceRange}>₹360 – ₹420</Text>
            {'\n'}Based on distance (32 km), quantity & route
          </Text>
        </View>

        {loading && bids.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.farmerColor} style={{ marginTop: 40 }} />
        ) : bids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Waiting for driver bids...</Text>
            <Text style={styles.emptySub}>Eligible drivers nearby have been notified.</Text>
          </View>
        ) : (
          bids.map(bid => {
            const isAccepted = bid.status === 'ACCEPTED' || acceptedId === bid.id;
            return (
              <View
                key={bid.id}
                style={[styles.offerCard, isAccepted && styles.offerCardAccepted]}
              >
                {/* Vehicle + Rating header */}
                <View style={styles.offerTop}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleEmoji}>🚚</Text>
                    <View>
                      <Text style={styles.driverName}>{bid.driver_name}</Text>
                      <Text style={styles.vehicleType}>{bid.vehicle_type || 'Tata Ace'}</Text>
                    </View>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingValue}>⭐ {bid.reliability ? (bid.reliability/20).toFixed(1) : '4.7'}</Text>
                    <Text style={styles.ratingTrips}>Reliability: {bid.reliability || 95}%</Text>
                  </View>
                </View>

                {/* Fare */}
                <View style={styles.fareRow}>
                  <View>
                    <Text style={styles.fareLabel}>Your Fare</Text>
                    <Text style={styles.fareValue}>₹{bid.amount}</Text>
                    {bid.amount > 420 ? (
                      <Text style={styles.fareWarning}>↑ Above recommended (₹420)</Text>
                    ) : (
                      <Text style={styles.fareGood}>✓ Within fair range</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.etaLabel}>Est. Pickup</Text>
                    <Text style={styles.etaValue}>Tomorrow Morning</Text>
                  </View>
                </View>

                {/* Actions */}
                {isAccepted ? (
                  <View style={styles.acceptedBanner}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.acceptedText}>Order Booked!</Text>
                  </View>
                ) : bid.status === 'REJECTED' ? (
                  <View style={[styles.acceptedBanner, { backgroundColor: Colors.error + '15' }]}>
                    <Text style={[styles.acceptedText, { color: Colors.error }]}>Declined</Text>
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(bid.id)}
                      disabled={!!acceptedId}
                    >
                      <Text style={styles.rejectBtnText}>✗ Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.acceptBtn, !!acceptedId && { opacity: 0.4 }]}
                      onPress={() => handleAccept(bid)}
                      disabled={!!acceptedId}
                    >
                      <Text style={styles.acceptBtnText}>✓ Accept — ₹{bid.amount}</Text>
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
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
  fairPriceInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.info + '15', borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.info + '30',
    marginBottom: Spacing.sm,
  },
  fairPriceText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  fairPriceRange: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 10 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  offerCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  offerCardAccepted: { borderColor: Colors.success + '70', backgroundColor: Colors.success + '08' },
  offerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vehicleEmoji: { fontSize: 28 },
  driverName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vehicleType: { fontSize: FontSize.xs, color: Colors.textMuted },
  ratingContainer: { alignItems: 'flex-end' },
  ratingValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  ratingTrips: { fontSize: FontSize.xs, color: Colors.textMuted },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  fareLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  fareValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.accent },
  fareWarning: { fontSize: FontSize.xs, color: Colors.warning },
  fareGood: { fontSize: FontSize.xs, color: Colors.success },
  etaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  etaValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: Spacing.md },
  rejectBtn: {
    flex: 1, height: 46, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.error + '50', backgroundColor: Colors.error + '15',
  },
  rejectBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.error },
  acceptBtn: {
    flex: 2, height: 46, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.md, backgroundColor: Colors.farmerColor, ...Shadow.sm,
  },
  acceptBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  acceptedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.success + '20', borderRadius: BorderRadius.md, paddingVertical: 12,
  },
  acceptedText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.success },
});
