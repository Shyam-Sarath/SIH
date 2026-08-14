// Farmer Profile Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { Language } from '../../types';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function FarmerProfileScreen() {
  const { userName, userPhone, language, setLanguage, logout } = useAuth();
  const [isCOD, setIsCOD] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👨‍🌾</Text>
            <View style={[styles.roleBadge, { backgroundColor: Colors.farmerColor + '20' }]}>
              <Text style={[styles.roleText, { color: Colors.farmerColor }]}>Farmer</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{userName || 'Farmer'}</Text>
          <Text style={styles.profilePhone}>+91 {userPhone}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLbl}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>₹8,400</Text>
              <Text style={styles.statLbl}>Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>4.8⭐</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Language preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language Preference</Text>
          <Text style={styles.sectionSub}>All notifications and messages will be in this language</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, language === lang.code && styles.langChipActive]}
                onPress={() => setLanguage(lang.code)}
              >
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={14} color={Colors.farmerColor} />
                )}
                <Text style={[styles.langNative, language === lang.code && { color: Colors.farmerColor }]}>
                  {lang.native}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentLabel}>{isCOD ? 'Cash on Delivery' : 'Digital Payment'}</Text>
              <Text style={styles.paymentSub}>{isCOD ? 'Pay driver at pickup' : 'Pay via KrishiBundle'}</Text>
            </View>
            <Switch
              value={!isCOD}
              onValueChange={v => setIsCOD(!v)}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.farmerColor + '60' }}
              thumbColor={isCOD ? Colors.textMuted : Colors.farmerColor}
            />
          </View>
        </View>

        {/* Recent orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Order History</Text>
          {[
            { id: 'KB1018', crop: 'Potato 40kg', dest: 'Broadway', amount: 450, date: '11 Aug' },
            { id: 'KB1010', crop: 'Onion 60kg', dest: 'Koyambedu', amount: 620, date: '08 Aug' },
            { id: 'KB1002', crop: 'Tomato 30kg', dest: 'Koyambedu', amount: 380, date: '02 Aug' },
          ].map(o => (
            <View key={o.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyId}>#{o.id}</Text>
                <Text style={styles.historyCrop}>{o.crop} → {o.dest}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>₹{o.amount}</Text>
                <Text style={styles.historyDate}>{o.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
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
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.md,
  },
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.md },
  avatarEmoji: { fontSize: 56, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  profileName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  profilePhone: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.surfaceBorder },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  langChipActive: { borderColor: Colors.farmerColor, backgroundColor: Colors.farmerColor + '15' },
  langNative: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  paymentLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  paymentSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  historyId: { fontSize: FontSize.xs, color: Colors.textMuted },
  historyCrop: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.accent },
  historyDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.error + '40', backgroundColor: Colors.error + '10',
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.error },
});
