// Admin Farmers Screen
import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';

const LANGUAGES: Record<string, string> = { en: '🇬🇧', ta: '🇮🇳', te: '🇮🇳', ml: '🇮🇳', hi: '🇮🇳' };
const LANG_NAMES: Record<string, string> = { en: 'English', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', hi: 'Hindi' };

const MOCK_FARMERS = [
  { id: 'FRM001', name: 'Raju Kumar', phone: '9876543210', orders: 12, completed: 11, cancelled: 1, totalKg: 380, totalSpent: 8400, lang: 'ta', lastOrder: '14 Aug' },
  { id: 'FRM002', name: 'Priya Devi', phone: '9876543220', orders: 8, completed: 8, cancelled: 0, totalKg: 240, totalSpent: 5200, lang: 'ml', lastOrder: '13 Aug' },
  { id: 'FRM003', name: 'Suresh Murugan', phone: '9876543230', orders: 5, completed: 4, cancelled: 1, totalKg: 190, totalSpent: 3800, lang: 'te', lastOrder: '11 Aug' },
  { id: 'FRM004', name: 'Anbu Selvan', phone: '9876543240', orders: 20, completed: 19, cancelled: 1, totalKg: 680, totalSpent: 14200, lang: 'en', lastOrder: '14 Aug' },
];

export default function AdminFarmersScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👨‍🌾 Farmers</Text>
        <Text style={styles.headerSub}>{MOCK_FARMERS.length} registered</Text>
      </View>

      <FlatList
        data={MOCK_FARMERS}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: f }) => (
          <View style={styles.farmerCard}>
            <View style={styles.cardTop}>
              <View style={styles.farmerInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{f.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.farmerName}>{f.name}</Text>
                  <Text style={styles.farmerPhone}>+91 {f.phone}</Text>
                </View>
              </View>
              <View style={styles.langBadge}>
                <Text style={styles.langFlag}>{LANGUAGES[f.lang]}</Text>
                <Text style={styles.langName}>{LANG_NAMES[f.lang]}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statVal}>{f.orders}</Text><Text style={styles.statLbl}>Orders</Text></View>
              <View style={styles.stat}><Text style={[styles.statVal, { color: Colors.success }]}>{f.completed}</Text><Text style={styles.statLbl}>Done</Text></View>
              <View style={styles.stat}><Text style={[styles.statVal, { color: Colors.error }]}>{f.cancelled}</Text><Text style={styles.statLbl}>Cancelled</Text></View>
              <View style={styles.stat}><Text style={styles.statVal}>{f.totalKg} kg</Text><Text style={styles.statLbl}>Shipped</Text></View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.totalSpent}>Total: <Text style={{ color: Colors.accent, fontWeight: FontWeight.bold }}>₹{f.totalSpent.toLocaleString()}</Text></Text>
              <Text style={styles.lastOrder}>Last: {f.lastOrder}</Text>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={14} color={Colors.farmerColor} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  farmerCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  farmerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.farmerColor + '30', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.farmerColor + '50',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.farmerColor },
  farmerName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  farmerPhone: { fontSize: FontSize.xs, color: Colors.textMuted },
  langBadge: { alignItems: 'center', backgroundColor: Colors.surfaceBorder, borderRadius: BorderRadius.sm, padding: 6 },
  langFlag: { fontSize: 18 },
  langName: { fontSize: FontSize.xs, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalSpent: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lastOrder: { fontSize: FontSize.xs, color: Colors.textMuted },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: Colors.farmerColor + '50', backgroundColor: Colors.farmerColor + '10',
  },
  callBtnText: { fontSize: FontSize.xs, color: Colors.farmerColor, fontWeight: FontWeight.semibold },
});
