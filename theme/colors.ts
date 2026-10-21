export const lightColors = {
  // Primary (black)
  primary: '#0A0A0A',
  primaryPressed: '#27272A',
  primarySoft: '#EDEDEF',
  primaryMuted: '#0A0A0A26',
  onPrimary: '#FFFFFF',

  // Accent
  accent: '#0A0A0A',

  // Backgrounds
  background: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  fill: '#EDEDEF',

  // Text
  textPrimary: '#0A0A0A',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',

  // Borders
  border: '#E4E4E7',
  borderLight: '#EEEEF0',

  // Semantic
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',

  // Glass
  glassTint: 'rgba(10, 10, 10, 0.06)',

  // AI accent
  aiAccent: '#0A0A0A',
  aiSoft: '#EDEDEF',

  // Charts: black -> grey ramp
  chart: ['#0A0A0A', '#27272A', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8'],

  // Graphite "bank card" gradient (same in both schemes) and the faint page backdrop
  cardGradient: ['#4A4A50', '#232326', '#0B0B0C'],
  screenGradient: ['#FFFFFF', '#F4F4F5'],
} as const;

export const darkColors = {
  primary: '#FAFAFA',
  primaryPressed: '#D4D4D8',
  primarySoft: '#1C1C1E',
  primaryMuted: '#FAFAFA26',
  onPrimary: '#0A0A0A',

  accent: '#FAFAFA',

  background: '#000000',
  surface: '#111111',
  surfaceElevated: '#1C1C1E',
  fill: '#1C1C1E',

  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  border: '#27272A',
  borderLight: '#1A1A1C',

  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',

  glassTint: 'rgba(250, 250, 250, 0.08)',

  aiAccent: '#FAFAFA',
  aiSoft: '#1C1C1E',

  chart: ['#FAFAFA', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46'],

  cardGradient: ['#4A4A50', '#232326', '#0B0B0C'],
  screenGradient: ['#18181A', '#000000'],
} as const;

export type AppColors = {
  [K in keyof typeof lightColors]: K extends 'chart' | 'cardGradient' | 'screenGradient' ? readonly string[] : string;
};

// Backwards-compatible alias (light palette). Prefer `useTheme()` in components.
export const colors: AppColors = lightColors;

export type ColorToken = keyof typeof lightColors;
