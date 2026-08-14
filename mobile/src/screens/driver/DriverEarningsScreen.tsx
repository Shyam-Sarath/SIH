// Driver Earnings Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const MOCK_EARNINGS = [
  {
    bundleId: 'bundle-001',
    date: '13 Aug 2026',
    route: 'Kurichi → Koyambedu',
    totalEarning: 380,
    breakdown: [
      { farmer: 'Raju Kumar', crop: 'Tomato 25kg', contribution: 120 },
      { farmer: 'Suresh Murugan', crop: 'Onion 30kg', contribution: 140 },
      { farmer: 'Meena Selvi', crop: 'Carrot 40kg', contribution: 120 },
    ],
    kbFee: 38,
    netEarning: 342,
  },
  {
    bundleId: 'bundle-002',
    date: '11 Aug 2026',
    route: 'Mettupalayam → Erode Market',
    totalEarning: 310,
    breakdown: [
      { farmer: 'Priya Devi', crop: 'Banana 40kg', contribution: 160 },
      { farmer: 'Anbu Selvan', crop: 'Mango 30kg', contribution: 150 },
    ],
    kbFee: 31,
    netEarning: 279,
  },
];

export default function DriverEarningsScreen() {
  const totalNet = MOCK_EARNINGS.reduce((sum, e) => sum + e.netEarning, 0);
  const totalGross = MOCK_EARNINGS.reduce((sum, e) => sum + e.totalEarning, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earned (This Month)</Text>
          <Text style={styles.summaryTotal}>₹{totalNet}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.sumItem}>
              <Text style={styles.sumVal}>₹{totalGross}</Text>
              <Text style={styles.sumLbl}>Gross</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={[styles.sumVal, { color: Colors.error }]}>-₹{totalGross - totalNet}</Text>
              <Text style={styles.sumLbl}>KB Fee (10%)</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={[styles.sumVal, { color: Colors.success }]}>₹{totalNet}</Text>
              <Text style={styles.sumLbl}>Net</Text>
            </View>
          </View>
        </View>

        {/* Trip breakdown */}
        <Text style={styles.sectionTitle}>Trip History</Text>
        {MOCK_EARNINGS.map(trip => (
          <View key={trip.bundleId} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View>
                <Text style={styles.tripDate}>{trip.date}</Text>
                <Text style={styles.tripRoute}>{trip.route}</Text>
              </View>
              <View style={styles.tripEarning}>
                <Text style={styles.tripNet}>₹{trip.netEarning}</Text>
                <Text style={styles.tripNetLabel}>net</Text>
              </View>
            </View>

            {/* Per-farmer breakdown */}
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>Per-farmer contribution (Shapley split):</Text>
              {trip.breakdown.map((b, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.breakdownFarmer}>{b.farmer}</Text>
                  <Text style={styles.breakdownCrop}>{b.crop}</Text>
                  <Text style={styles.breakdownAmount}>₹{b.contribution}</Text>
                </View>
              ))}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownFarmer, { color: Colors.error }]}>KrishiBundle Fee</Text>
                <Text style={styles.breakdownCrop}>(10%)</Text>
                <Text style={[styles.breakdownAmount, { color: Colors.error }]}>-₹{trip.kbFee}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownFarmer, { color: Colors.success, fontWeight: FontWeight.bold }]}>Net Earning</Text>
                <Text style={styles.breakdownCrop}></Text>
                <Text style={[styles.breakdownAmount, { color: Colors.success, fontWeight: FontWeight.bold }]}>₹{trip.netEarning}</Text>
              </View>
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
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.driverColor + '40', alignItems: 'center', ...Shadow.md,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  summaryTotal: { fontSize: FontSize.display, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  sumItem: { alignItems: 'center' },
  sumVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sumLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  sumDivider: { width: 1, height: 30, backgroundColor: Colors.surfaceBorder },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  tripCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  tripDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  tripRoute: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  tripEarning: { alignItems: 'flex-end' },
  tripNet: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.success },
  tripNetLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  breakdownBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md },
  breakdownTitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 8, fontStyle: 'italic' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  breakdownFarmer: { flex: 2, fontSize: FontSize.sm, color: Colors.textPrimary },
  breakdownCrop: { flex: 2, fontSize: FontSize.xs, color: Colors.textMuted },
  breakdownAmount: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  breakdownDivider: { height: 1, backgroundColor: Colors.surfaceBorder, marginVertical: 6 },
});
