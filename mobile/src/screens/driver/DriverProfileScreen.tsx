// Driver Profile Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { useAuth } from '../../store/AuthContext';

export default function DriverProfileScreen() {
  const { userName, userPhone, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const currentLoad = 620;
  const capacity = 1000;
  const available = capacity - currentLoad;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <Text style={styles.avatar}>🚚</Text>
          <View style={[styles.roleBadge, { backgroundColor: Colors.driverColor + '20' }]}>
            <Text style={[styles.roleText, { color: Colors.driverColor }]}>Driver</Text>
          </View>
          <Text style={styles.name}>{userName || 'Driver'}</Text>
          <Text style={styles.phone}>+91 {userPhone}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statVal}>48</Text><Text style={styles.statLbl}>Trips</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statVal}>4.7⭐</Text><Text style={styles.statLbl}>Rating</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statVal}>₹12.4K</Text><Text style={styles.statLbl}>Earned</Text></View>
          </View>
        </View>

        {/* Availability toggle */}
        <View style={styles.section}>
          <View style={styles.availRow}>
            <View>
              <Text style={styles.sectionTitle}>🟢 Availability</Text>
              <Text style={styles.sectionSub}>{isAvailable ? 'Accepting new trips' : 'Not accepting trips'}</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.driverColor + '60' }}
              thumbColor={isAvailable ? Colors.driverColor : Colors.textMuted}
            />
          </View>
        </View>

        {/* Vehicle info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚛 Vehicle</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Type</Text>
              <Text style={styles.vehicleValue}>Tata Ace</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Capacity</Text>
              <Text style={styles.vehicleValue}>{capacity} kg</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Current Load</Text>
              <Text style={[styles.vehicleValue, { color: Colors.warning }]}>{currentLoad} kg</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Available</Text>
              <Text style={[styles.vehicleValue, { color: Colors.success }]}>{available} kg</Text>
            </View>
            {/* Load bar */}
            <View style={styles.loadBarContainer}>
              <View style={styles.loadBar}>
                <View style={[styles.loadFill, { width: `${(currentLoad / capacity) * 100}%` }]} />
              </View>
              <Text style={styles.loadPct}>{Math.round((currentLoad / capacity) * 100)}% full</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 100 },
  profileCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.driverColor + '30', ...Shadow.md,
  },
  avatar: { fontSize: 56, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full, marginBottom: 8 },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  phone: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDiv: { width: 1, height: 30, backgroundColor: Colors.surfaceBorder },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  availRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  vehicleCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 10,
  },
  vehicleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  vehicleValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  loadBarContainer: { gap: 4 },
  loadBar: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
  loadFill: { height: '100%', backgroundColor: Colors.warning, borderRadius: 4 },
  loadPct: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.error + '40', backgroundColor: Colors.error + '10',
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.error },
});
