// Login Screen — handles all 3 roles
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../store/AuthContext';
import { Language } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;
type Route = RouteProp<AuthStackParamList, 'Login'>;

const roleConfig = {
  farmer: { color: Colors.farmerColor, emoji: '👨‍🌾', label: 'Farmer', bgColor: '#1B4332' },
  driver: { color: Colors.driverColor, emoji: '🚚', label: 'Driver', bgColor: '#0A3D5C' },
  admin: { color: Colors.adminColor, emoji: '🖥️', label: 'Admin', bgColor: '#5C3A00' },
};

const DEMO_CREDENTIALS = {
  farmer: { phone: '9876543210', otp: '1234', name: 'Raju Kumar' },
  driver: { phone: '9876543211', otp: '1234', name: 'Suresh Driver' },
  admin: { phone: '9876543212', otp: '1234', name: 'Admin User' },
};

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { role } = route.params;
  const { login } = useAuth();
  const config = roleConfig[role];

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    // Pre-fill demo credentials
    setPhone(DEMO_CREDENTIALS[role].phone);
  }, []);

  const handleSendOTP = () => {
    if (phone.length < 10) {
      Alert.alert('Invalid', 'Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtp('1234'); // Demo OTP pre-filled
    }, 1000);
  };

  const handleVerify = async () => {
    if (otp !== '1234') {
      Alert.alert('Invalid OTP', 'Use 1234 for demo');
      return;
    }
    setLoading(true);
    try {
      const demo = DEMO_CREDENTIALS[role];
      const lang: Language = role === 'farmer' ? 'ta' : 'en';
      await login(
        `demo-${role}-001`,
        demo.name,
        phone,
        role,
        lang,
      );
    } catch (e) {
      Alert.alert('Error', 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.bgAccent} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Role Badge */}
          <View style={[styles.roleBadge, { backgroundColor: config.bgColor }]}>
            <Text style={styles.roleEmoji}>{config.emoji}</Text>
          </View>
          <Text style={[styles.roleLabel, { color: config.color }]}>{config.label} Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Ionicons name="information-circle" size={16} color={Colors.info} />
            <Text style={styles.demoHintText}>Demo: Use OTP 1234</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
                placeholderTextColor={Colors.textMuted}
                editable={!otpSent}
              />
            </View>
          </View>

          {/* OTP Input */}
          {otpSent && (
            <Animated.View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OTP</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color={Colors.textMuted} />
                <TextInput
                  style={[styles.input, { marginLeft: Spacing.sm }]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="Enter OTP"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </Animated.View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: config.color }, loading && styles.ctaBtnDisabled]}
            onPress={otpSent ? handleVerify : handleSendOTP}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>
              {loading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />}
          </TouchableOpacity>

          {/* Signup link */}
          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup', { role })}
          >
            <Text style={styles.signupLinkText}>
              New user? <Text style={[styles.signupLinkBold, { color: config.color }]}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 220,
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.xxxl },
  backBtn: { marginBottom: Spacing.xl },
  content: { flex: 1 },
  roleBadge: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  roleEmoji: { fontSize: 38 },
  roleLabel: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  demoHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.info + '18',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.info + '30',
  },
  demoHintText: { fontSize: FontSize.sm, color: Colors.info },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md, height: 52,
  },
  countryCode: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.md, height: 54,
    marginTop: Spacing.lg, gap: Spacing.sm, ...Shadow.md,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textInverse },
  signupLink: { alignItems: 'center', marginTop: Spacing.xl },
  signupLinkText: { fontSize: FontSize.md, color: Colors.textSecondary },
  signupLinkBold: { fontWeight: FontWeight.bold },
});
