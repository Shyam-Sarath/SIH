// Admin Orders Screen — full live order list with manual override
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { OrderStatus } from '../../types';

const MOCK_ORDERS = [
  { id: 'KB1029', farmer: 'Ramu S.', crop: 'Tomato', qty: 25, status: 'ADMIN_REVIEW' as OrderStatus, confidence: 42, dest: 'Koyambedu', date: '14 Aug', flag: true },
  { id: 'KB1028', farmer: 'Priya D.', crop: 'Banana', qty: 40, status: 'BIDDING' as OrderStatus, confidence: 96, dest: 'Erode Market', date: '14 Aug', flag: false },
  { id: 'KB1027', farmer: 'Suresh M.', crop: 'Onion', qty: 60, status: 'IN_TRANSIT' as OrderStatus, confidence: 91, dest: 'Koyambedu', date: '14 Aug', flag: false },
  { id: 'KB1026', farmer: 'Meena S.', crop: 'Carrot', qty: 30, status: 'ADMIN_REVIEW' as OrderStatus, confidence: 38, dest: 'Broadway', date: '14 Aug', flag: true },
  { id: 'KB1025', farmer: 'Unknown', crop: 'Unknown', qty: 0, status: 'ADMIN_REVIEW' as OrderStatus, confidence: 28, dest: '?', date: '14 Aug', flag: true },
  { id: 'KB1024', farmer: 'Raju K.', crop: 'Tomato', qty: 25, status: 'BIDDING' as OrderStatus, confidence: 94, dest: 'Koyambedu', date: '14 Aug', flag: false },
  { id: 'KB1021', farmer: 'Anbu S.', crop: 'Mango', qty: 50, status: 'DELIVERED' as OrderStatus, confidence: 98, dest: 'Erode Market', date: '13 Aug', flag: false },
];

const STATUS_COLOR: Record<string, string> = {
  ADMIN_REVIEW: Colors.error,
  PLACED: Colors.info,
  VALIDATED: Colors.success,
  BIDDING: Colors.accent,
  ACCEPTED: Colors.success,
  IN_TRANSIT: Colors.driverColor,
  DELIVERED: Colors.success,
  COMPLETED: Colors.success,
};

const FILTERS = ['All', 'Review', 'Bidding', 'In Transit', 'Delivered'];

export default function AdminOrdersScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ORDERS.filter(o => {
    const matchSearch = !search || o.id.includes(search) || o.farmer.toLowerCase().includes(search.toLowerCase()) || o.crop.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All'
      || (activeFilter === 'Review' && o.status === 'ADMIN_REVIEW')
      || (activeFilter === 'Bidding' && o.status === 'BIDDING')
      || (activeFilter === 'In Transit' && o.status === 'IN_TRANSIT')
      || (activeFilter === 'Delivered' && o.status === 'DELIVERED');
    return matchSearch && matchFilter;
  });

  const handleOverride = (orderId: string, action: string) => {
    Alert.alert(`Admin Override: ${action}`, `Order #${orderId}\nAre you sure?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: () => Alert.alert('Done', `Order #${orderId} — ${action} applied.`) },
    ]);
  };

  const renderOrder = ({ item: o }: { item: typeof MOCK_ORDERS[0] }) => (
    <View style={[styles.orderCard, o.flag && styles.orderCardFlagged]}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          {o.flag && <Ionicons name="warning" size={14} color={Colors.error} />}
          <Text style={styles.orderId}>#{o.id}</Text>
          <Text style={styles.orderDate}>{o.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[o.status] || Colors.textMuted) + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[o.status] || Colors.textMuted }]}>
            {o.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.farmerName}>👨‍🌾 {o.farmer}</Text>
        <Text style={styles.cropInfo}>{o.crop} — {o.qty} kg → {o.dest}</Text>
        <View style={styles.confidenceRow}>
          <Text style={styles.confLabel}>AI confidence:</Text>
          <Text style={[styles.confValue, { color: o.confidence >= 80 ? Colors.success : Colors.error }]}>
            {o.confidence}%
          </Text>
        </View>
      </View>

      {/* Override actions */}
      <View style={styles.actions}>
        {o.status === 'ADMIN_REVIEW' && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleOverride(o.id, 'Approve')}>
              <Ionicons name="checkmark" size={14} color={Colors.success} />
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleOverride(o.id, 'Reject')}>
              <Ionicons name="close" size={14} color={Colors.error} />
              <Text style={[styles.actionBtnText, { color: Colors.error }]}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleOverride(o.id, 'Assign Driver')}>
          <Ionicons name="car" size={14} color={Colors.driverColor} />
          <Text style={[styles.actionBtnText, { color: Colors.driverColor }]}>Assign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleOverride(o.id, 'Cancel')}>
          <Ionicons name="ban" size={14} color={Colors.textMuted} />
          <Text style={styles.actionBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Orders</Text>
        <Text style={styles.headerCount}>{MOCK_ORDERS.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search order, farmer, crop..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && { color: Colors.adminColor }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, marginHorizontal: Spacing.lg, marginVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder, height: 44,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  filterChipActive: { borderColor: Colors.adminColor, backgroundColor: Colors.adminColor + '20' },
  filterText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  orderCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadow.sm,
  },
  orderCardFlagged: { borderColor: Colors.error + '40', backgroundColor: Colors.error + '08' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardBody: { gap: 4, marginBottom: Spacing.md },
  farmerName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  cropInfo: { fontSize: FontSize.sm, color: Colors.textSecondary },
  confidenceRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  confLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  confValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.sm, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  actionBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textMuted },
});
