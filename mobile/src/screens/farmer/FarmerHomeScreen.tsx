// Farmer Home Screen — text + voice order placement with AI preview
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Animated, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { Order } from '../../types';

// Mock AI extraction — replace with Groq API call
const mockExtractOrder = (text: string) => ({
  crop: 'Tomato',
  quantityKg: 25,
  pickupLocation: 'Village Kurichi',
  destination: 'Koyambedu Market, Chennai',
  preferredDate: 'Tomorrow',
  aiConfidence: Math.random() > 0.3 ? 94 : 42,
});

const CROPS = ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Banana', 'Mango', 'Coconut', 'Chilli', 'Carrot', 'Cabbage'];

export default function FarmerHomeScreen() {
  const { userName } = useAuth();
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [orderText, setOrderText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      stopPulse();
      // Simulate voice result
      setOrderText('என்கிட்ட 25 கிலோ தக்காளி இருக்கு, நாளைக்கு கோயம்பேடு மார்க்கெட்டுக்கு அனுப்பணும்');
      handleAnalyze('voice input');
    } else {
      setIsListening(true);
      startPulse();
      setTimeout(() => {
        setIsListening(false);
        stopPulse();
        setOrderText('என்கிட்ட 25 கிலோ தக்காளி இருக்கு, நாளைக்கு கோயம்பேடு மார்க்கெட்டுக்கு அனுப்பணும்');
        handleAnalyze('voice input');
      }, 3000);
    }
  };

  const handleAnalyze = (text: string) => {
    setLoading(true);
    setTimeout(() => {
      const extracted = mockExtractOrder(text);
      setPreviewOrder(extracted);
      setLoading(false);
    }, 1200);
  };

  const handleSubmitOrder = () => {
    if (!previewOrder) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setPreviewOrder(null);
      setOrderText('');
      Alert.alert(
        '✅ Order Placed!',
        `Your order for ${previewOrder.quantityKg} kg ${previewOrder.crop} has been submitted.\n\nDrivers will be notified shortly.`,
        [{ text: 'OK', onPress: () => setSubmitted(false) }]
      );
    }, 1000);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { label: '✅ Auto-processed', color: Colors.success, bg: Colors.success + '20' };
    return { label: '⚠️ Sent for review', color: Colors.warning, bg: Colors.warning + '20' };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 🌅</Text>
            <Text style={styles.name}>{userName || 'Farmer'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🌾</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹2,400</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8⭐</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
        </View>

        {/* Order Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Place New Order</Text>

          {/* Input Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, inputMode === 'text' && styles.modeBtnActive]}
              onPress={() => setInputMode('text')}
            >
              <Ionicons name="create-outline" size={18} color={inputMode === 'text' ? Colors.farmerColor : Colors.textMuted} />
              <Text style={[styles.modeBtnText, inputMode === 'text' && { color: Colors.farmerColor }]}>Type</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, inputMode === 'voice' && styles.modeBtnActive]}
              onPress={() => setInputMode('voice')}
            >
              <Ionicons name="mic-outline" size={18} color={inputMode === 'voice' ? Colors.farmerColor : Colors.textMuted} />
              <Text style={[styles.modeBtnText, inputMode === 'voice' && { color: Colors.farmerColor }]}>Voice</Text>
            </TouchableOpacity>
          </View>

          {inputMode === 'text' ? (
            <>
              <TextInput
                style={styles.textarea}
                value={orderText}
                onChangeText={setOrderText}
                placeholder="Describe your order... e.g. I have 50 kg tomatoes to send to Koyambedu market tomorrow"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.analyzeBtn, !orderText && { opacity: 0.4 }]}
                onPress={() => handleAnalyze(orderText)}
                disabled={!orderText || loading}
              >
                <Ionicons name="sparkles-outline" size={18} color={Colors.textInverse} />
                <Text style={styles.analyzeBtnText}>{loading ? 'Analyzing...' : 'AI Analyze Order'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.voiceContainer}>
              <Animated.View style={[styles.micOuter, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[styles.micBtn, isListening && styles.micBtnActive]}
                  onPress={handleVoiceToggle}
                >
                  <Ionicons name={isListening ? 'stop' : 'mic'} size={36} color={Colors.textPrimary} />
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.voiceHint}>
                {isListening ? '🎙️ Listening... Tap to stop' : 'Tap to speak your order'}
              </Text>
              <Text style={styles.voiceLangHint}>You can speak in Tamil, Telugu, Malayalam, Hindi or English</Text>
              {orderText ? (
                <View style={styles.transcriptCard}>
                  <Text style={styles.transcriptLabel}>AI understood:</Text>
                  <Text style={styles.transcriptText}>"{orderText}"</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* AI Preview Card */}
        {previewOrder && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>🤖 AI Understood This</Text>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceBadge(previewOrder.aiConfidence).bg }]}>
                <Text style={[styles.confidenceText, { color: getConfidenceBadge(previewOrder.aiConfidence).color }]}>
                  {previewOrder.aiConfidence}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.previewStatusBadge}>
              <Text style={styles.previewStatusText}>{getConfidenceBadge(previewOrder.aiConfidence).label}</Text>
            </View>

            <View style={styles.previewFields}>
              {[
                { icon: '🌿', label: 'Crop', value: previewOrder.crop },
                { icon: '⚖️', label: 'Quantity', value: `${previewOrder.quantityKg} kg` },
                { icon: '📍', label: 'Pickup', value: previewOrder.pickupLocation },
                { icon: '🏪', label: 'Market', value: previewOrder.destination },
                { icon: '📅', label: 'Date', value: previewOrder.preferredDate },
              ].map(f => (
                <View key={f.label} style={styles.previewRow}>
                  <Text style={styles.previewIcon}>{f.icon}</Text>
                  <Text style={styles.previewLabel}>{f.label}</Text>
                  <Text style={styles.previewValue}>{f.value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.previewHint}>Verify the details and confirm your order</Text>

            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => setPreviewOrder(null)}>
                <Text style={styles.rejectBtnText}>✗ Wrong</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmitOrder}
                disabled={loading}
              >
                <Text style={styles.confirmBtnText}>{loading ? 'Submitting...' : '✓ Confirm Order'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick repeat */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Repeat</Text>
          <TouchableOpacity style={styles.repeatCard}>
            <View style={styles.repeatInfo}>
              <Text style={styles.repeatCrop}>🍅 Tomato — 25 kg</Text>
              <Text style={styles.repeatDest}>→ Koyambedu Market</Text>
            </View>
            <View style={styles.repeatBtn}>
              <Text style={styles.repeatBtnText}>Repeat</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primary + '30', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '50',
  },
  avatarText: { fontSize: 26 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  modeToggle: {
    flexDirection: 'row', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, padding: 4, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.sm - 2 },
  modeBtnActive: { backgroundColor: Colors.farmerColor + '20' },
  modeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMuted },
  textarea: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary,
    minHeight: 100, textAlignVertical: 'top', marginBottom: Spacing.md,
  },
  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    height: 50, ...Shadow.md,
  },
  analyzeBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  voiceContainer: { alignItems: 'center', paddingVertical: Spacing.xl },
  micOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary + '25', justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  micBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadow.glow,
  },
  micBtnActive: { backgroundColor: Colors.error },
  voiceHint: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, textAlign: 'center' },
  voiceLangHint: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: 6, paddingHorizontal: Spacing.xl },
  transcriptCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.lg, width: '100%',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  transcriptLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  transcriptText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontStyle: 'italic' },
  previewCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.farmerColor + '40', ...Shadow.md,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  previewTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confidenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  previewStatusBadge: { marginBottom: Spacing.md },
  previewStatusText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  previewFields: { gap: 10, marginBottom: Spacing.md },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewIcon: { fontSize: 18, width: 26 },
  previewLabel: { fontSize: FontSize.sm, color: Colors.textMuted, width: 70 },
  previewValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, flex: 1 },
  previewHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md, textAlign: 'center' },
  previewActions: { flexDirection: 'row', gap: Spacing.md },
  rejectBtn: {
    flex: 1, height: 46, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.error + '60', backgroundColor: Colors.error + '15',
  },
  rejectBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.error },
  confirmBtn: {
    flex: 2, height: 46, justifyContent: 'center', alignItems: 'center',
    borderRadius: BorderRadius.md, backgroundColor: Colors.farmerColor, ...Shadow.sm,
  },
  confirmBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  repeatCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  repeatInfo: {},
  repeatCrop: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  repeatDest: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  repeatBtn: {
    backgroundColor: Colors.farmerColor + '25', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.farmerColor + '50',
  },
  repeatBtnText: { fontSize: FontSize.sm, color: Colors.farmerColor, fontWeight: FontWeight.bold },
});
