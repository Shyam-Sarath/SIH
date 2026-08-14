// Driver My Trips — assigned trips with optimized sequence and Supabase updates
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { fetchDriverTrips, updateTripStatus, updateOrderStatusAdmin } from '../../services/dbService';
import { useAuth } from '../../store/AuthContext';
import { OrderState } from '../../utils/orderStateMachine';

export default function DriverTripsScreen() {
  const { userPhone } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [userPhone]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await fetchDriverTrips(userPhone || '9876541111');
      setTrips(data || []);
    } catch (e) {
      console.warn('Failed to load driver trips:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = (trip: any) => {
    Alert.alert('Confirm Pickup', `Mark crop pickup for Order #${trip.order_id} as completed?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setLoading(true);
            await updateTripStatus(trip.id, 'PICKED_UP');
            // Transition order status to PICKUP / IN_TRANSIT
            await updateOrderStatusAdmin(trip.order_id, OrderState.IN_TRANSIT);
            Alert.alert('✅ Picked Up!', 'Cargo loaded. State updated in system.');
          } catch (err) {
            Alert.alert('Error', 'Failed to update pickup status.');
          } finally {
            setLoading(false);
            loadTrips();
          }
        },
      },
    ]);
  };

  const handleDeliver = (trip: any) => {
    Alert.alert('Arrived at Destination', `Confirm delivery at market for Order #${trip.order_id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Delivery',
        onPress: async () => {
          try {
            setLoading(true);
            await updateTripStatus(trip.id, 'DELIVERED');
            // Transition order status to DELIVERED
            await updateOrderStatusAdmin(trip.order_id, OrderState.DELIVERED);
            Alert.alert('🎉 Delivered!', 'Order delivered successfully.');
          } catch (err) {
            Alert.alert('Error', 'Failed to update delivery status.');
          } finally {
            setLoading(false);
            loadTrips();
          }
        },
      },
    ]);
  };

  const activeTrip = trips[0]; // Active trip stop representation

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Trip</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.driverColor} />
        </View>
      ) : !activeTrip ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No active assigned trips</Text>
          <Text style={styles.emptySub}>Bid on orders in the Feed tab to get assignments.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Trip summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{activeTrip.orders?.crop || 'Crops'}</Text>
                <Text style={styles.summaryLbl}>Cargo Type</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{activeTrip.orders?.quantity || 0} kg</Text>
                <Text style={styles.summaryLbl}>Total Load</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: Colors.driverColor }]}>₹{activeTrip.orders?.current_fare || 380}</Text>
                <Text style={styles.summaryLbl}>Fare Earning</Text>
              </View>
            </View>

            <View style={styles.destinationRow}>
              <Ionicons name="flag" size={16} color={Colors.accent} />
              <Text style={styles.destinationText}>{activeTrip.orders?.destination || 'Market'}</Text>
            </View>
          </View>

          {/* Map placeholder */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={Colors.textMuted} />
            <Text style={styles.mapText}>Optimized Route Map</Text>
            <Text style={styles.mapSub}>Stop 1: Coimbatore → Drop: {activeTrip.orders?.destination}</Text>
          </View>

          {/* Stop sequence timeline */}
          <Text style={styles.stopsTitle}>Pickup Sequence</Text>
          
          {/* Stop 1: Pickup */}
          <View style={[styles.stopCard, activeTrip.status !== 'ASSIGNED' && styles.stopCardDone]}>
            <View style={styles.stopLeft}>
              <View style={[styles.stopNumber, { 
                backgroundColor: activeTrip.status !== 'ASSIGNED' ? Colors.success + '30' : Colors.driverColor + '30', 
                borderColor: activeTrip.status !== 'ASSIGNED' ? Colors.success : Colors.driverColor 
              }]}>
                <Text style={[styles.stopNumberText, { color: activeTrip.status !== 'ASSIGNED' ? Colors.success : Colors.driverColor }]}>1</Text>
              </View>
              <View style={[styles.stopConnector, activeTrip.status !== 'ASSIGNED' && styles.stopConnectorDone]} />
            </View>
            <View style={styles.stopContent}>
              <View style={styles.stopHeader}>
                <Text style={styles.stopFarmer}>{activeTrip.orders?.farmer_name || 'Farmer'}</Text>
                {activeTrip.status !== 'ASSIGNED' && (
                  <View style={styles.pickedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.pickedText}>Picked Up</Text>
                  </View>
                )}
              </View>
              <Text style={styles.stopCrop}>{activeTrip.orders?.crop} — {activeTrip.orders?.quantity} kg</Text>
              <View style={styles.stopAddressRow}>
                <Ionicons name="location" size={14} color={Colors.textMuted} />
                <Text style={styles.stopAddress}>Farmer location, Coimbatore</Text>
              </View>
              {activeTrip.status === 'ASSIGNED' && (
                <TouchableOpacity style={styles.pickupBtn} onPress={() => handlePickup(activeTrip)}>
                  <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                  <Text style={styles.pickupBtnText}>Confirm Pickup</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stop 2: Destination Drop */}
          <View style={[styles.stopCard, activeTrip.status === 'DELIVERED' && styles.stopCardDone]}>
            <View style={styles.stopLeft}>
              <View style={[styles.stopNumber, { 
                backgroundColor: activeTrip.status === 'DELIVERED' ? Colors.success + '30' : Colors.accent + '30', 
                borderColor: activeTrip.status === 'DELIVERED' ? Colors.success : Colors.accent 
              }]}>
                <Text style={[styles.stopNumberText, { color: activeTrip.status === 'DELIVERED' ? Colors.success : Colors.accent }]}>2</Text>
              </View>
            </View>
            <View style={styles.stopContent}>
              <View style={styles.stopHeader}>
                <Text style={styles.stopFarmer}>Market Dropoff</Text>
                {activeTrip.status === 'DELIVERED' && (
                  <View style={styles.pickedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.pickedText}>Delivered</Text>
                  </View>
                )}
              </View>
              <Text style={styles.stopCrop}>{activeTrip.orders?.destination}</Text>
              {activeTrip.status === 'PICKED_UP' && (
                <TouchableOpacity style={[styles.pickupBtn, { backgroundColor: Colors.success }]} onPress={() => handleDeliver(activeTrip)}>
                  <Ionicons name="flag-outline" size={16} color={Colors.textInverse} />
                  <Text style={styles.pickupBtnText}>Confirm Delivery at Market</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120, gap: 10 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  summaryLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
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
  stopsTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  stopCard: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  stopCardDone: { opacity: 0.7 },
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
    backgroundColor: Colors.driverColor, borderRadius: BorderRadius.sm, height: 36, marginTop: Spacing.sm,
  },
  pickupBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },
});
