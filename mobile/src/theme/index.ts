// KrishiBundle Design System
export const Colors = {
  // Primary — earthy green
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  primaryDark: '#1B4332',
  primaryGlow: '#40916C',

  // Accent — warm amber (harvest)
  accent: '#F4A261',
  accentLight: '#FFB347',
  accentDark: '#E76F51',

  // Neutral
  background: '#0A0F0D',
  surface: '#121A16',
  surfaceElevated: '#1C2820',
  surfaceBorder: '#2A3D30',

  // Text
  textPrimary: '#F0FAF4',
  textSecondary: '#9DB5A6',
  textMuted: '#5C7A66',
  textInverse: '#0A0F0D',

  // Status
  success: '#52B788',
  warning: '#F4A261',
  error: '#E63946',
  info: '#4CC9F0',

  // Role colors
  farmerColor: '#52B788',
  driverColor: '#4CC9F0',
  adminColor: '#F4A261',

  // Gradients (used as arrays)
  gradientPrimary: ['#1B4332', '#2D6A4F', '#40916C'],
  gradientAccent: ['#E76F51', '#F4A261', '#FFB347'],
  gradientDark: ['#0A0F0D', '#121A16', '#1C2820'],
  gradientCard: ['#1C2820', '#151F1A'],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 42,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#52B788',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
};
