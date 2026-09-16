export const colors = {
  // Primary
  primary: '#000000',
  primaryPressed: '#333333',
  primarySoft: '#E5E5EA',
  primaryMuted: '#00000026', // 15% opacity

  // Backgrounds
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#636366',
  textMuted: '#AEAEB2',

  // Borders
  border: '#E5E5EA',
  borderLight: '#F2F2F7',

  // Semantic
  success: '#34C759',
  warning: '#FF9F0A',
  danger: '#FF3B30',

  // Glass
  glassTint: 'rgba(0, 0, 0, 0.08)',

  // AI accent
  aiAccent: '#000000',
  aiSoft: '#E5E5EA',
} as const;

export type ColorToken = keyof typeof colors;
