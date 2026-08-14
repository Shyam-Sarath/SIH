// Power Admin Orders Screen — Full manual override capabilities
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
  Alert, TextInput, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { OrderState, STATE_LABELS, needsAttention, canTransition } from '../../utils/orderStateMachine';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DRIVERS_LIST = [
  { id: 'DRV001', name: 'Suresh Kumar', vehicle: 'Tata Ace', available: 380 },
  { id: 'DRV002', name: 'Ramesh Selvam', vehicle: 'AL Dost', available: 800 },
  { id: 'DRV004', name: 'Vijay Pandi', vehicle: 'Tata Ace', available: 1000 },
];

interface MockBid {
  driverId: string;
  driverName: string;
  vehicle: string;
  amount: number;
  reliability: number;
  isRecommended: boolean;
}

interface MockOrder {
  id: string;
  farmer: string;
  phone: string;
  crop: string;
  qty: number;
  destination: string;
  date: string;
  state: OrderState;
  confidence: number;
  transcript?: string;
  bids: MockBid[];
  currentFare?: number;
  assignedDriver?: string;
}

const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'KB1029', farmer: 'Ramu S.', phone: '9876543210',
    crop: 'Tomato', qty: 25, destination: 'Koyambedu', date: '14 Aug',
    state: OrderState.ADMIN_REVIEW, confidence: 42,
    transcript: 'தக்காளி பத்து கிலோ... நாளைக்கு... சந்தை...',
    bids: [], currentFare: undefined,
  },
  {
    id: 'KB1028', farmer: 'Priya D.', phone: '9876543220',
    crop: 'Banana', qty: 40, destination: 'Erode Market', date: '14 Aug',
    state: OrderState.AWAITING_BIDS, confidence: 96,
    bids: [
      { driverId: 'DRV001', driverName: 'Suresh Kumar', vehicle: 'Tata Ace', amount: 420, reliability: 92, isRecommended: false },
      { driverId: 'DRV002', driverName: 'Ramesh Selvam', vehicle: 'AL Dost', amount: 380, reliability: 97, isRecommended: true },
      { driverId: 'DRV004', driverName: 'Vijay Pandi', vehicle: 'Tata Ace', amount: 400, reliability: 89, isRecommended: false },
    ],
  },
  {
    id: 'KB1027', farmer: 'Suresh M.', phone: '9876543230',
    crop: 'Onion', qty: 60, destination: 'Koyambedu', date: '14 Aug',
    state: OrderState.IN_TRANSIT, confidence: 91,
    bids: [], assignedDriver: 'Vijay Pandi', currentFare: 520,
  },
  {
    id: 'KB1025', farmer: 'Unknown', phone: '9876540000',
    crop: 'Unknown', qty: 0, destination: '?', date: '14 Aug',
    state: OrderState.AI_LOW_CONFIDENCE, confidence: 28,
    transcript: 'Night call — no intelligible speech detected',
    bids: [],
  },
];

const FILTERS = ['All', 'Needs Review', 'Bidding', 'In Transit', 'Completed'];

const STATE_COLOR: Record<string, string> = {
  [OrderState.ADMIN_REVIEW]:      Colors.error,
  [OrderState.AI_LOW_CONFIDENCE]: Colors.error,
  [OrderState.CREATED]:           Colors.info,
  [OrderState.PROCESSING]:        Colors.info,
  [OrderState.AWAITING_BIDS]:     Colors.accent,
  [OrderState.BID_RECEIVED]:      Colors.accent,
  [OrderState.OFFER_SENT]:        Colors.accent,
  [OrderState.ACCEPTED]:          Colors.success,
  [OrderState.DRIVER_ASSIGNED]:   Colors.success,
  [OrderState.PICKUP]:            Colors.driverColor,
  [OrderState.IN_TRANSIT]:        Colors.driverColor,
  [OrderState.DELIVERED]:         Colors.success,
  [OrderState.COMPLETED]:         Colors.success,
  [OrderState.CANCELLED]:         Colors.textMuted,
  [OrderState.DRIVER_REJECTED]:   Colors.warning,
  [OrderState.PAYMENT_FAILED]:    Colors.error,
};

// ─── Override Action Modal ─────────────────────────────────────────────────────

interface OverrideModalProps {
  order: MockOrder | null;
  onClose: () => void;
  onAction: (orderId: string, action: string, data?: any) => void;
}

function OverrideModal({ order, onClose, onAction }: OverrideModalProps) {
  const [newFare, setNewFare] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  if (!order) return null;

  return (
    <Modal visible animationType="slide" transparent>
      <View style={mStyles.overlay}>
        <View style={mStyles.sheet}>
          <View style={mStyles.sheetHandle} />

          {/* Header */}
          <View style={mStyles.sheetHeader}>
            <View>
              <Text style={mStyles.sheetTitle}>Admin Override</Text>
              <Text style={mStyles.sheetSub}>Order #{order.id} · {order.crop} {order.qty}kg</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current state */}
            <View style={mStyles.stateBadge}>
              <Text style={mStyles.stateLabel}>Current State:</Text>
              <Text style={[mStyles.stateValue, { color: STATE_COLOR[order.state] || Colors.textMuted }]}>
                {STATE_LABELS[order.state]}
              </Text>
            </View>

            {/* === AI Review Section === */}
            {(order.state === OrderState.ADMIN_REVIEW || order.state === OrderState.AI_LOW_CONFIDENCE) && (
              <View style={mStyles.section}>
                <Text style={mStyles.sectionTitle}>🤖 AI Review</Text>
                {order.transcript && (
                  <View style={mStyles.transcriptBox}>
                    <Text style={mStyles.transcriptLabel}>Voice transcript:</Text>
                    <Text style={mStyles.transcriptText}>"{order.transcript}"</Text>
                    <Text style={mStyles.confidenceText}>Confidence: {order.confidence}%</Text>
                  </View>
                )}
                <View style={mStyles.actionRow}>
                  <TouchableOpacity
                    style={[mStyles.actionBtn, { borderColor: Colors.success + '60', backgroundColor: Colors.success + '15' }]}
                    onPress={() => { onAction(order.id, 'APPROVE'); onClose(); }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={[mStyles.actionBtnText, { color: Colors.success }]}>Approve & Process</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[mStyles.actionBtn, { borderColor: Colors.error + '60', backgroundColor: Colors.error + '15' }]}
                    onPress={() => { onAction(order.id, 'REJECT'); onClose(); }}
                  >
                    <Ionicons name="ban" size={16} color={Colors.error} />
                    <Text style={[mStyles.actionBtnText, { color: Colors.error }]}>Reject / Spam</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[mStyles.actionBtn, { borderColor: Colors.driverColor + '60', backgroundColor: Colors.driverColor + '15', width: '100%' }]}
                  onPress={() => Alert.alert('Call Farmer', `Calling +91 ${order.phone}...`)}
                >
                  <Ionicons name="call" size={16} color={Colors.driverColor} />
                  <Text style={[mStyles.actionBtnText, { color: Colors.driverColor }]}>📞 Call Farmer (+91 {order.phone})</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* === Bidding Section === */}
            {order.bids.length > 0 && (
              <View style={mStyles.section}>
                <Text style={mStyles.sectionTitle}>💰 Bids Received</Text>
                {order.bids.map(bid => (
                  <View key={bid.driverId} style={[mStyles.bidRow, bid.isRecommended && mStyles.bidRowRecommended]}>
                    <View style={mStyles.bidInfo}>
                      {bid.isRecommended && (
                        <Text style={mStyles.recommendedBadge}>⭐ RECOMMENDED</Text>
                      )}
                      <Text style={mStyles.bidDriver}>{bid.driverName}</Text>
                      <Text style={mStyles.bidVehicle}>{bid.vehicle} · {bid.reliability}% reliability</Text>
                    </View>
                    <View style={mStyles.bidRight}>
                      <Text style={mStyles.bidAmount}>₹{bid.amount}</Text>
                      <TouchableOpacity
                        style={mStyles.selectDriverBtn}
                        onPress={() => { onAction(order.id, 'SELECT_DRIVER', { driverId: bid.driverId, fare: bid.amount }); onClose(); }}
                      >
                        <Text style={mStyles.selectDriverText}>Select</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={mStyles.emergencyBox}>
                  <Text style={mStyles.emergencyTitle}>🚨 Emergency Controls</Text>
                  <TouchableOpacity
                    style={mStyles.emergencyBtn}
                    onPress={() => { onAction(order.id, 'CANCEL_BIDDING'); onClose(); }}
                  >
                    <Text style={mStyles.emergencyBtnText}>Stop Bidding</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={mStyles.emergencyBtn}
                    onPress={() => { onAction(order.id, 'REOPEN_BIDDING'); onClose(); }}
                  >
                    <Text style={mStyles.emergencyBtnText}>Reopen Bidding</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* === Force Assign Driver === */}
            <View style={mStyles.section}>
              <Text style={mStyles.sectionTitle}>👨‍🚗 Force Assign Driver</Text>
              {MOCK_DRIVERS_LIST.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[mStyles.driverOption, selectedDriver === d.id && mStyles.driverOptionSelected]}
                  onPress={() => setSelectedDriver(d.id)}
                >
                  <Text style={mStyles.driverOptionName}>{d.name}</Text>
                  <Text style={mStyles.driverOptionSub}>{d.vehicle} · {d.available}kg free</Text>
                  {selectedDriver === d.id && <Ionicons name="checkmark-circle" size={18} color={Colors.adminColor} />}
                </TouchableOpacity>
              ))}
              {selectedDriver && (
                <TouchableOpacity
                  style={mStyles.forceAssignBtn}
                  onPress={() => { onAction(order.id, 'FORCE_ASSIGN', { driverId: selectedDriver }); onClose(); }}
                >
                  <Ionicons name="flash" size={16} color={Colors.textInverse} />
                  <Text style={mStyles.forceAssignText}>Force Assign Selected Driver</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* === Change Fare === */}
            <View style={mStyles.section}>
              <Text style={mStyles.sectionTitle}>💸 Override Fare</Text>
              <View style={mStyles.fareRow}>
                <View style={mStyles.fareInput}>
                  <Text style={mStyles.rupee}>₹</Text>
                  <TextInput
                    style={mStyles.fareTextInput}
                    value={newFare}
                    onChangeText={setNewFare}
                    keyboardType="numeric"
                    placeholder="Enter new fare"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <TouchableOpacity
                  style={[mStyles.fareSetBtn, !newFare && { opacity: 0.4 }]}
                  disabled={!newFare}
                  onPress={() => { onAction(order.id, 'CHANGE_FARE', { fare: Number(newFare) }); onClose(); }}
                >
                  <Text style={mStyles.fareSetText}>Set Fare</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* === Cancel Order === */}
            <TouchableOpacity
              style={mStyles.cancelOrderBtn}
              onPress={() => Alert.alert(
                'Cancel Order?',
                'This will cancel the entire order and notify the farmer.',
                [
                  { text: 'Back', style: 'cancel' },
                  { text: 'Cancel Order', style: 'destructive', onPress: () => { onAction(order.id, 'CANCEL'); onClose(); } },
                ]
              )}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
              <Text style={mStyles.cancelOrderText}>Cancel Order</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import { useEffect } from 'react';
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from '../../services/dbService';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrdersAdmin();
      // Map data fields to match UI keys
      const formatted = (data || []).map((o: any) => ({
        id: o.id,
        farmer: o.farmer_name || 'Farmer',
        phone: o.farmer_phone || '9876543210',
        crop: o.crop,
        qty: o.quantity,
        destination: o.destination,
        date: o.date || 'Today',
        state: o.status,
        confidence: o.confidence || 100,
        transcript: o.raw_transcript,
        bids: o.bids || [],
        currentFare: o.current_fare || o.fare_offer,
        assignedDriver: o.assigned_driver,
      }));
      setOrders(formatted);
    } catch (e) {
      console.warn('Failed to load admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: string, data?: any) => {
    let newState = OrderState.ADMIN_REVIEW;
    let extraParams: any = {};

    switch (action) {
      case 'APPROVE':
        newState = OrderState.AWAITING_BIDS;
        break;
      case 'REJECT':
      case 'CANCEL':
      case 'CANCEL_BIDDING':
        newState = OrderState.CANCELLED;
        break;
      case 'SELECT_DRIVER':
      case 'FORCE_ASSIGN':
        newState = OrderState.DRIVER_ASSIGNED;
        extraParams = { assigned_driver: data?.driverId, current_fare: data?.fare };
        break;
      case 'REOPEN_BIDDING':
        newState = OrderState.AWAITING_BIDS;
        break;
      case 'CHANGE_FARE':
        // Modify fare without modifying status directly
        const target = orders.find(o => o.id === orderId);
        newState = target ? target.state : OrderState.AWAITING_BIDS;
        extraParams = { current_fare: data?.fare };
        break;
      default:
        return;
    }

    try {
      await updateOrderStatusAdmin(orderId, newState, extraParams);
      await loadAllOrders(); // reload list
      Alert.alert('✅ Done', `Action "${action}" applied successfully.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search
      || o.id.includes(search)
      || o.farmer.toLowerCase().includes(search.toLowerCase())
      || o.crop.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'All'
      || (activeFilter === 'Needs Review' && needsAttention(o.state))
      || (activeFilter === 'Bidding' && [OrderState.AWAITING_BIDS, OrderState.BID_RECEIVED, OrderState.OFFER_SENT].includes(o.state))
      || (activeFilter === 'In Transit' && o.state === OrderState.IN_TRANSIT)
      || (activeFilter === 'Completed' && o.state === OrderState.COMPLETED);
    return matchSearch && matchFilter;
  });

  const needsReviewCount = orders.filter(o => needsAttention(o.state)).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Orders</Text>
        <View style={styles.headerRight}>
          {needsReviewCount > 0 && (
            <View style={styles.alertPill}>
              <Text style={styles.alertPillText}>{needsReviewCount} need review</Text>
            </View>
          )}
          <Text style={styles.headerCount}>{orders.length} total</Text>
        </View>
      </View>

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
        contentContainerStyle={styles.list}
        renderItem={({ item: o }) => {
          const color = STATE_COLOR[o.state] || Colors.textMuted;
          const flagged = needsAttention(o.state);
          return (
            <View style={[styles.orderCard, flagged && styles.orderCardFlagged]}>
              <View style={styles.cardTop}>
                <View style={styles.cardTopLeft}>
                  {flagged && <Ionicons name="warning" size={15} color={Colors.error} />}
                  <Text style={styles.orderId}>#{o.id}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.statusText, { color }]}>{STATE_LABELS[o.state as OrderState]}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.farmerName}>👨‍🌾 {o.farmer}</Text>
                <Text style={styles.cropInfo}>{o.crop} — {o.qty} kg → {o.destination}</Text>
                <View style={styles.confRow}>
                  <Text style={styles.confLabel}>AI:</Text>
                  <Text style={[styles.confValue, { color: o.confidence >= 80 ? Colors.success : Colors.error }]}>
                    {o.confidence}% confidence
                  </Text>
                  {o.bids.length > 0 && (
                    <Text style={styles.bidsCount}>· {o.bids.length} bids</Text>
                  )}
                  {o.assignedDriver && (
                    <Text style={styles.assignedText}>· Driver: {o.assignedDriver}</Text>
                  )}
                </View>
              </View>

              {/* Quick actions row */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickBtn, { borderColor: Colors.adminColor + '40' }]}
                  onPress={() => setSelectedOrder(o)}
                >
                  <Ionicons name="settings" size={14} color={Colors.adminColor} />
                  <Text style={[styles.quickBtnText, { color: Colors.adminColor }]}>Override</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => Alert.alert('Call', `Calling ${o.farmer}: +91 ${o.phone}`)}
                >
                  <Ionicons name="call" size={14} color={Colors.driverColor} />
                  <Text style={[styles.quickBtnText, { color: Colors.driverColor }]}>Call</Text>
                </TouchableOpacity>
                {needsAttention(o.state) && (
                  <TouchableOpacity
                    style={[styles.quickBtn, { borderColor: Colors.success + '40' }]}
                    onPress={() => handleAction(o.id, 'APPROVE')}
                  >
                    <Ionicons name="checkmark" size={14} color={Colors.success} />
                    <Text style={[styles.quickBtnText, { color: Colors.success }]}>Approve</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.quickBtn, { borderColor: Colors.error + '30' }]}
                  onPress={() => Alert.alert('Cancel Order?', `Cancel #${o.id}?`, [
                    { text: 'No', style: 'cancel' },
                    { text: 'Cancel Order', style: 'destructive', onPress: () => handleAction(o.id, 'CANCEL') },
                  ])}
                >
                  <Ionicons name="close" size={14} color={Colors.error} />
                  <Text style={[styles.quickBtnText, { color: Colors.error }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <OverrideModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAction={handleAction}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertPill: { backgroundColor: Colors.error + '25', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.error + '50' },
  alertPillText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.bold },
  headerCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, marginHorizontal: Spacing.lg, marginVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder, height: 44,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, flexWrap: 'wrap' },
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
  orderCardFlagged: { borderColor: Colors.error + '50', backgroundColor: Colors.error + '06' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardBody: { gap: 4, marginBottom: Spacing.sm },
  farmerName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  cropInfo: { fontSize: FontSize.sm, color: Colors.textSecondary },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  confLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  confValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  bidsCount: { fontSize: FontSize.xs, color: Colors.accent },
  assignedText: { fontSize: FontSize.xs, color: Colors.success },
  quickActions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  quickBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textMuted },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingHorizontal: Spacing.lg, paddingBottom: 40,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, alignSelf: 'center', marginVertical: Spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sheetSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  stateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  stateLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  stateValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  transcriptBox: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.error + '30',
  },
  transcriptLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  transcriptText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontStyle: 'italic', marginBottom: 4 },
  confidenceText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.bold },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: 8,
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  bidRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  bidRowRecommended: { borderColor: Colors.success + '70', backgroundColor: Colors.success + '08' },
  bidInfo: { flex: 1 },
  recommendedBadge: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold, marginBottom: 2 },
  bidDriver: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bidVehicle: { fontSize: FontSize.xs, color: Colors.textMuted },
  bidRight: { alignItems: 'flex-end', gap: 6 },
  bidAmount: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.accent },
  selectDriverBtn: {
    backgroundColor: Colors.driverColor, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  selectDriverText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textInverse },
  emergencyBox: {
    backgroundColor: Colors.error + '10', borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.error + '30',
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm,
  },
  emergencyTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.error, marginBottom: 8, width: '100%' },
  emergencyBtn: {
    flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: Colors.error + '50', alignItems: 'center',
  },
  emergencyBtnText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.bold },
  driverOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  driverOptionSelected: { borderColor: Colors.adminColor, backgroundColor: Colors.adminColor + '15' },
  driverOptionName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  driverOptionSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  forceAssignBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.adminColor, borderRadius: BorderRadius.md, height: 46,
    marginTop: 4, ...Shadow.sm,
  },
  forceAssignText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  fareRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  fareInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, paddingHorizontal: Spacing.md, height: 46,
  },
  rupee: { fontSize: FontSize.lg, color: Colors.textPrimary, marginRight: 4 },
  fareTextInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  fareSetBtn: { backgroundColor: Colors.adminColor, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 46, justifyContent: 'center' },
  fareSetText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  cancelOrderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.error + '50', backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md, height: 46, marginBottom: Spacing.lg,
  },
  cancelOrderText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.error },
});
