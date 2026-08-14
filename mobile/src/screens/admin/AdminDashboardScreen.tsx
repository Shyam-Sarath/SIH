// Admin Dashboard Screen — live stats control center
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { useAuth } from '../../store/AuthContext';

const STATS = {
  activeOrders: 128,
  bidding: 34,
  inTransit: 51,
  deliveredToday: 82,
  activeDrivers: 243,
  totalFarmers: 1420,
  todayRevenue: 84320,
  driverEarnings: 72900,
  pendingReview: 3,
};

const AI_QUEUE = [
  { id: 'KB1029', confidence: 42, transcript: 'தக்காளி பத்து கிலோ...நாளைக்கு...', flag: 'Low confidence' },
  { id: 'KB1027', confidence: 38, transcript: 'Bhindi... fifty... send to market...', flag: 'Crop unclear' },
  { id: 'KB1025', confidence: 28, transcript: 'Night call — spam suspected', flag: '12AM–3AM order' },
];

function StatCard({ icon, value, label, color, sub }: { icon: string; value: string; label: string; color?: string; sub?: string }) {
  return (
    <View style={[styles.statCard, color && { borderColor: color + '30' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { userName, logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>KrishiBundle Admin</Text>
            <Text style={styles.name}>{userName || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutIcon} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Live alert — AI review queue */}
        {STATS.pendingReview > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>
              {STATS.pendingReview} orders need manual review (low AI confidence)
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </View>
        )}

        {/* Main stats grid */}
        <Text style={styles.sectionTitle}>📊 Live Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="📦" value={STATS.activeOrders.toString()} label="Active Orders" color={Colors.info} />
          <StatCard icon="🔥" value={STATS.bidding.toString()} label="Bidding" color={Colors.accent} />
          <StatCard icon="🚚" value={STATS.inTransit.toString()} label="In Transit" color={Colors.driverColor} />
          <StatCard icon="✅" value={STATS.deliveredToday.toString()} label="Delivered Today" color={Colors.success} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="👨‍🚗" value={STATS.activeDrivers.toString()} label="Active Drivers" />
          <StatCard icon="👨‍🌾" value={STATS.totalFarmers.toLocaleString()} label="Farmers" />
          <StatCard icon="💰" value={`₹${(STATS.todayRevenue / 1000).toFixed(1)}K`} label="Revenue Today" color={Colors.farmerColor} />
          <StatCard icon="🤝" value={`₹${(STATS.driverEarnings / 1000).toFixed(1)}K`} label="Driver Earnings" color={Colors.success} />
        </View>

        {/* AI Confidence Queue */}
        <Text style={styles.sectionTitle}>🤖 AI Confidence Queue</Text>
        <Text style={styles.sectionSub}>Orders needing manual verification</Text>
        {AI_QUEUE.map(item => (
          <View key={item.id} style={styles.queueCard}>
            <View style={styles.queueTop}>
              <Text style={styles.queueId}>#{item.id}</Text>
              <View style={[styles.confidenceBadge, { backgroundColor: Colors.error + '20' }]}>
                <Text style={[styles.confidenceText, { color: Colors.error }]}>{item.confidence}% confidence</Text>
              </View>
            </View>
            <Text style={styles.queueFlag}>🚩 {item.flag}</Text>
            <Text style={styles.queueTranscript}>"{item.transcript}"</Text>
            <View style={styles.queueActions}>
              <TouchableOpacity style={styles.queueRejectBtn}>
                <Text style={styles.queueRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.queueCallBtn}>
                <Ionicons name="call" size={14} color={Colors.driverColor} />
                <Text style={styles.queueCallText}>Call Farmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.queueApproveBtn}>
                <Text style={styles.queueApproveText}>✓ Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {[
            { icon: '➕', label: 'Create Order', color: Colors.farmerColor },
            { icon: '👨‍🚗', label: 'Assign Driver', color: Colors.driverColor },
            { icon: '🚫', label: 'Cancel Order', color: Colors.error },
            { icon: '📞', label: 'Contact Farmer', color: Colors.info },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[styles.quickAction, { borderColor: a.color + '30' }]}>
              <Text style={styles.quickActionIcon}>{a.icon}</Text>
              <Text style={[styles.quickActionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.sm, color: Colors.adminColor, fontWeight: FontWeight.semibold },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  logoutIcon: { padding: 8 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.warning + '18', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.warning + '40',
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },
  alertText: { flex: 1, fontSize: FontSize.sm, color: Colors.warning, fontWeight: FontWeight.medium },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: Spacing.sm,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  statSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  queueCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.error + '30', ...Shadow.sm,
  },
  queueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  queueId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confidenceBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  queueFlag: { fontSize: FontSize.sm, color: Colors.warning, marginBottom: 4 },
  queueTranscript: { fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: Spacing.md },
  queueActions: { flexDirection: 'row', gap: 8 },
  queueRejectBtn: {
    flex: 1, height: 36, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.error + '50', backgroundColor: Colors.error + '10',
  },
  queueRejectText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.bold },
  queueCallBtn: {
    flex: 1.5, height: 36, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.driverColor + '50', backgroundColor: Colors.driverColor + '10',
  },
  queueCallText: { fontSize: FontSize.sm, color: Colors.driverColor, fontWeight: FontWeight.bold },
  queueApproveBtn: {
    flex: 1.5, height: 36, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.sm, backgroundColor: Colors.success,
  },
  queueApproveText: { fontSize: FontSize.sm, color: Colors.textInverse, fontWeight: FontWeight.bold },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickAction: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, marginBottom: Spacing.sm,
  },
  quickActionIcon: { fontSize: 28 },
  quickActionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },
});
