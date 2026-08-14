// Admin Dashboard Screen — live stats control center
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { fetchAdminStats } from '../../services/dbService';

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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (e) {
      console.warn('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.adminColor} />
      </View>
    );
  }

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
        {stats.pendingReview > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>
              {stats.pendingReview} orders need manual review (low AI confidence)
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </View>
        )}

        {/* Main stats grid */}
        <Text style={styles.sectionTitle}>📊 Live Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="📦" value={stats.activeOrders.toString()} label="Active Orders" color={Colors.info} />
          <StatCard icon="🔥" value={stats.bidding.toString()} label="Bidding" color={Colors.accent} />
          <StatCard icon="✅" value={stats.completedToday.toString()} label="Delivered Today" color={Colors.success} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="👨‍🚗" value={stats.activeDrivers.toString()} label="Active Drivers" />
          <StatCard icon="👨‍🌾" value={stats.totalFarmers.toString()} label="Farmers" />
          <StatCard icon="💰" value={`₹${stats.todayRevenue}`} label="Revenue" color={Colors.farmerColor} />
          <StatCard icon="🤝" value={`₹${stats.driverEarnings.toFixed(0)}`} label="Driver Earnings" color={Colors.success} />
        </View>

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
    flex: 1, minWidth: '30%', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: Spacing.sm,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  statSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickAction: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, marginBottom: Spacing.sm,
  },
  quickActionIcon: { fontSize: 28 },
  quickActionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },
});
