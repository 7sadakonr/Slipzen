export const colors = {
  // Primary
  primary: '#777AFF',
  primaryPressed: '#5F62E6',
  primarySoft: '#EDEDFF',
  primaryMuted: '#777AFF26', // 15% opacity

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
  glassTint: 'rgba(119, 122, 255, 0.08)',

  // AI accent
  aiAccent: '#777AFF',
  aiSoft: '#F0EEFF',
} as const;

export type ColorToken = keyof typeof colors;
