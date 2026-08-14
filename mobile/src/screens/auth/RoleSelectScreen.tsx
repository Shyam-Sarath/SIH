// Role Select Screen — the first screen users see
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  StatusBar, Dimensions, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

type Nav = StackNavigationProp<AuthStackParamList, 'RoleSelect'>;

const roles = [
  {
    role: 'farmer' as const,
    label: 'Farmer',
    subLabel: 'I grow & sell produce',
    icon: 'leaf',
    color: Colors.farmerColor,
    gradient: '#1B4332',
    emoji: '👨‍🌾',
  },
  {
    role: 'driver' as const,
    label: 'Driver',
    subLabel: 'I transport goods',
    icon: 'car-sport',
    color: Colors.driverColor,
    gradient: '#0A3D5C',
    emoji: '🚚',
  },
  {
    role: 'admin' as const,
    label: 'Admin',
    subLabel: 'I manage the platform',
    icon: 'shield-checkmark',
    color: Colors.adminColor,
    gradient: '#5C3A00',
    emoji: '🖥️',
  },
];

export default function RoleSelectScreen() {
  const navigation = useNavigation<Nav>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardAnims = roles.map(() => useRef(new Animated.Value(60)).current);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.stagger(120, cardAnims.map(anim =>
        Animated.spring(anim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true })
      )),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🌾</Text>
          </View>
        </View>
        <Text style={styles.appName}>KrishiBundle</Text>
        <Text style={styles.tagline}>Shared Agricultural Logistics</Text>
        <View style={styles.divider} />
        <Text style={styles.selectText}>Who are you?</Text>
      </Animated.View>

      <View style={styles.rolesContainer}>
        {roles.map((item, i) => (
          <Animated.View
            key={item.role}
            style={{ transform: [{ translateY: cardAnims[i] }], opacity: fadeAnim }}
          >
            <TouchableOpacity
              style={styles.roleCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login', { role: item.role })}
            >
              <View style={[styles.roleCardInner, { borderColor: item.color + '40' }]}>
                <View style={[styles.iconBg, { backgroundColor: item.gradient }]}>
                  <Text style={styles.roleEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={[styles.roleLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={styles.roleSubLabel}>{item.subLabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={item.color} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        Empowering small farmers through shared logistics
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '12',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent + '0A',
    bottom: 100,
    left: -60,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    ...Shadow.glow,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.primaryLight,
    borderRadius: 1,
    marginVertical: Spacing.md,
  },
  selectText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  roleCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  roleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  roleSubLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
