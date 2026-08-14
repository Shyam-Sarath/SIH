// Admin Drivers Screen
import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const MOCK_DRIVERS = [
  { id: 'DRV001', name: 'Suresh Kumar', vehicle: 'Tata Ace', capacity: 1000, currentLoad: 620, activeOrders: 2, rating: 4.7, trips: 48, earnings: 12400, isAvailable: true },
  { id: 'DRV002', name: 'Ramesh Selvam', vehicle: 'Ashok Leyland Dost', capacity: 1500, currentLoad: 200, activeOrders: 1, rating: 4.9, trips: 124, earnings: 38200, isAvailable: true },
  { id: 'DRV003', name: 'Anbu Murugan', vehicle: 'Mahindra Pickup', capacity: 800, currentLoad: 800, activeOrders: 1, rating: 4.2, trips: 21, earnings: 6800, isAvailable: false },
  { id: 'DRV004', name: 'Vijay Pandi', vehicle: 'Tata Ace', capacity: 1000, currentLoad: 0, activeOrders: 0, rating: 4.6, trips: 67, earnings: 19200, isAvailable: true },
];

export default function AdminDriversScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 Drivers</Text>
        <Text style={styles.headerSub}>{MOCK_DRIVERS.length} registered</Text>
      </View>

      <FlatList
        data={MOCK_DRIVERS}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: d }) => {
          const loadPct = Math.round((d.currentLoad / d.capacity) * 100);
          return (
            <View style={styles.driverCard}>
              <View style={styles.cardTop}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverEmoji}>🚚</Text>
                  <View>
                    <Text style={styles.driverName}>{d.name}</Text>
                    <Text style={styles.vehicleType}>{d.vehicle}</Text>
                  </View>
                </View>
                <View style={[styles.availBadge, { backgroundColor: d.isAvailable ? Colors.success + '20' : Colors.error + '20' }]}>
                  <View style={[styles.availDot, { backgroundColor: d.isAvailable ? Colors.success : Colors.error }]} />
                  <Text style={[styles.availText, { color: d.isAvailable ? Colors.success : Colors.error }]}>
                    {d.isAvailable ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}><Text style={styles.statVal}>{d.capacity} kg</Text><Text style={styles.statLbl}>Capacity</Text></View>
                <View style={styles.stat}><Text style={[styles.statVal, { color: Colors.warning }]}>{d.currentLoad} kg</Text><Text style={styles.statLbl}>Load</Text></View>
                <View style={styles.stat}><Text style={styles.statVal}>{d.activeOrders}</Text><Text style={styles.statLbl}>Active</Text></View>
                <View style={styles.stat}><Text style={styles.statVal}>⭐{d.rating}</Text><Text style={styles.statLbl}>Rating</Text></View>
              </View>

              {/* Load bar */}
              <View style={styles.loadRow}>
                <Text style={styles.loadLabel}>Utilization {loadPct}%</Text>
                <View style={styles.loadBar}>
                  <View style={[styles.loadFill, { width: `${loadPct}%`, backgroundColor: loadPct > 90 ? Colors.error : Colors.driverColor }]} />
                </View>
              </View>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Total earnings</Text>
                <Text style={styles.earningsValue}>₹{d.earnings.toLocaleString()}</Text>
                <Text style={styles.tripsLabel}>{d.trips} trips</Text>
              </View>

              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="call" size={14} color={Colors.driverColor} />
                <Text style={styles.contactBtnText}>Contact Driver</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
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
  list: { padding: Spacing.lg, paddingBottom: 100 },
  driverCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverEmoji: { fontSize: 28 },
  driverName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vehicleType: { fontSize: FontSize.xs, color: Colors.textMuted },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  loadRow: { gap: 4, marginBottom: Spacing.sm },
  loadLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  loadBar: { height: 6, backgroundColor: Colors.surface, borderRadius: 3, overflow: 'hidden' },
  loadFill: { height: '100%', borderRadius: 3 },
  earningsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  earningsLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  earningsValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.success },
  tripsLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.driverColor + '50',
    backgroundColor: Colors.driverColor + '10', height: 36,
  },
  contactBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.driverColor },
});
