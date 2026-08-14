// Farmer Offers Screen — Accept/Reject incoming fare offers
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const MOCK_OFFERS = [
  {
    id: 'offer-001',
    orderId: 'KB1024',
    crop: 'Tomato',
    quantity: 25,
    vehicleType: 'Tata Ace',
    capacity: '1 Ton',
    fare: 380,
    recommendedFare: 390,
    estimatedPickup: 'Tomorrow, 6:30 AM',
    driverRating: 4.7,
    totalTrips: 48,
    reliabilityScore: 92,
    bundledWith: ['Onion 30kg (Farmer Suresh)', 'Carrot 15kg (Farmer Meena)'],
    explanation: 'Price includes route deviation of 4.2km from driver\'s original route',
  },
  {
    id: 'offer-002',
    orderId: 'KB1024',
    crop: 'Tomato',
    quantity: 25,
    vehicleType: 'Ashok Leyland Dost',
    capacity: '1.5 Ton',
    fare: 420,
    recommendedFare: 390,
    estimatedPickup: 'Tomorrow, 8:00 AM',
    driverRating: 4.9,
    totalTrips: 124,
    reliabilityScore: 97,
    bundledWith: ['Onion 30kg (Farmer Suresh)'],
    explanation: 'Slightly higher fare due to larger, more reliable vehicle',
  },
];

export default function FarmerOffersScreen() {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  const handleAccept = (offer: typeof MOCK_OFFERS[0]) => {
    Alert.alert(
      '✅ Accept Offer?',
      `Fare: ₹${offer.fare}\nVehicle: ${offer.vehicleType}\nPickup: ${offer.estimatedPickup}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => {
            setAcceptedId(offer.id);
            Alert.alert('🎉 Order Confirmed!', 'Driver has been assigned. You will receive contact details shortly.');
          },
        },
      ]
    );
  };

  const handleReject = (offerId: string) => {
    Alert.alert('Offer Rejected', 'We will look for better options for you.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Offers</Text>
        <Text style={styles.headerSub}>{MOCK_OFFERS.length} offers for Order #KB1024</Text>
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

        {MOCK_OFFERS.map(offer => (
          <View
            key={offer.id}
            style={[styles.offerCard, acceptedId === offer.id && styles.offerCardAccepted]}
          >
            {/* Vehicle + Rating header */}
            <View style={styles.offerTop}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleEmoji}>🚚</Text>
                <View>
                  <Text style={styles.vehicleType}>{offer.vehicleType}</Text>
                  <Text style={styles.vehicleCapacity}>Capacity: {offer.capacity}</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingValue}>⭐ {offer.driverRating}</Text>
                <Text style={styles.ratingTrips}>{offer.totalTrips} trips</Text>
              </View>
            </View>

            {/* Reliability bar */}
            <View style={styles.reliabilityRow}>
              <Text style={styles.reliabilityLabel}>Reliability</Text>
              <View style={styles.reliabilityBar}>
                <View style={[styles.reliabilityFill, { width: `${offer.reliabilityScore}%` }]} />
              </View>
              <Text style={styles.reliabilityScore}>{offer.reliabilityScore}%</Text>
            </View>

            {/* Bundled with */}
            <View style={styles.bundleBox}>
              <Text style={styles.bundleTitle}>📦 Bundled with your shipment:</Text>
              {offer.bundledWith.map((b, i) => (
                <Text key={i} style={styles.bundleItem}>• {b}</Text>
              ))}
            </View>

            {/* Fare */}
            <View style={styles.fareRow}>
              <View>
                <Text style={styles.fareLabel}>Your Fare</Text>
                <Text style={styles.fareValue}>₹{offer.fare}</Text>
                {offer.fare > offer.recommendedFare && (
                  <Text style={styles.fareWarning}>↑ Above recommended (₹{offer.recommendedFare})</Text>
                )}
                {offer.fare <= offer.recommendedFare && (
                  <Text style={styles.fareGood}>✓ Within fair range</Text>
                )}
              </View>
              <View>
                <Text style={styles.etaLabel}>Est. Pickup</Text>
                <Text style={styles.etaValue}>{offer.estimatedPickup}</Text>
              </View>
            </View>

            <Text style={styles.explanation}>💡 {offer.explanation}</Text>

            {/* Actions */}
            {acceptedId === offer.id ? (
              <View style={styles.acceptedBanner}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.acceptedText}>Order Confirmed!</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(offer.id)}
                  disabled={!!acceptedId}
                >
                  <Text style={styles.rejectBtnText}>✗ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptBtn, !!acceptedId && { opacity: 0.4 }]}
                  onPress={() => handleAccept(offer)}
                  disabled={!!acceptedId}
                >
                  <Text style={styles.acceptBtnText}>✓ Accept — ₹{offer.fare}</Text>
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
  offerCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  offerCardAccepted: { borderColor: Colors.success + '70', backgroundColor: Colors.success + '08' },
  offerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vehicleEmoji: { fontSize: 28 },
  vehicleType: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vehicleCapacity: { fontSize: FontSize.xs, color: Colors.textMuted },
  ratingContainer: { alignItems: 'flex-end' },
  ratingValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  ratingTrips: { fontSize: FontSize.xs, color: Colors.textMuted },
  reliabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  reliabilityLabel: { fontSize: FontSize.xs, color: Colors.textMuted, width: 65 },
  reliabilityBar: { flex: 1, height: 6, backgroundColor: Colors.surfaceBorder, borderRadius: 3, overflow: 'hidden' },
  reliabilityFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 3 },
  reliabilityScore: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.success, width: 30, textAlign: 'right' },
  bundleBox: {
    backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  bundleTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 4 },
  bundleItem: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  fareLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  fareValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.accent },
  fareWarning: { fontSize: FontSize.xs, color: Colors.warning },
  fareGood: { fontSize: FontSize.xs, color: Colors.success },
  etaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  etaValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, textAlign: 'right' },
  explanation: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md, fontStyle: 'italic' },
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
