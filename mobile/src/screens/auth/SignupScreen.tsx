// Signup Screen
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../store/AuthContext';
import { Language } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'Signup'>;
type Route = RouteProp<AuthStackParamList, 'Signup'>;

const roleConfig = {
  farmer: { color: Colors.farmerColor, emoji: '👨‍🌾', label: 'Farmer' },
  driver: { color: Colors.driverColor, emoji: '🚚', label: 'Driver' },
  admin: { color: Colors.adminColor, emoji: '🖥️', label: 'Admin' },
};

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { role } = route.params;
  const { login } = useAuth();
  const config = roleConfig[role];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [vehicleType, setVehicleType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone) {
      Alert.alert('Missing info', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await login(`new-${role}-${Date.now()}`, name, phone, role, language);
    } catch {
      Alert.alert('Error', 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.title}>{config.emoji} Register as {config.label}</Text>
        <Text style={styles.subtitle}>Create your KrishiBundle account</Text>

        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.code}>+91</Text>
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="10-digit number"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Language (farmers only) */}
          {role === 'farmer' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Language</Text>
              <View style={styles.langRow}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, language === lang.code && styles.langChipActive]}
                    onPress={() => setLanguage(lang.code)}
                  >
                    <Text style={[styles.langChipText, language === lang.code && { color: Colors.farmerColor }]}>
                      {lang.native}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Driver vehicle info */}
          {role === 'driver' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleType}
                  onChangeText={setVehicleType}
                  placeholder="e.g. Tata Ace, Ashok Leyland"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Capacity (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                  placeholder="e.g. 1000"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: config.color }, loading && { opacity: 0.6 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.ctaBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: 56 },
  backBtn: { marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  form: { gap: Spacing.md },
  inputGroup: {},
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md, height: 50,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md, height: 50,
    textAlignVertical: 'center', lineHeight: 50,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  langChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  langChipActive: { borderColor: Colors.farmerColor, backgroundColor: Colors.farmerColor + '20' },
  langChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, borderRadius: BorderRadius.md, height: 54,
    marginTop: Spacing.md, ...Shadow.md,
  },
  ctaBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textInverse },
});
