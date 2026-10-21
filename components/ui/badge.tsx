import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { makeStyles, useTheme, AppColors } from '../../theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Value to display (number or string). If undefined/null, renders as a status dot */
  content?: string | number;
  /** Color semantic variant */
  variant?: BadgeVariant;
  /** Controls visibility */
  visible?: boolean;
  /** Maximum number to show before appending '+' (default: 99) */
  max?: number;
  /** Size preset */
  size?: BadgeSize;
  /** Element to anchor badge onto top-right */
  children?: React.ReactNode;
  /** Custom badge container styling */
  style?: StyleProp<ViewStyle>;
  /** Custom text styling */
  textStyle?: StyleProp<TextStyle>;
  /** Custom [top, right] offset adjustments when anchored to children */
  offset?: [number, number];
}

const getVariantColors = (colors: AppColors): Record<BadgeVariant, { bg: string; text: string }> => ({
  default: { bg: colors.primary, text: colors.onPrimary },
  success: { bg: colors.success, text: '#FFFFFF' },
  warning: { bg: colors.warning, text: '#FFFFFF' },
  danger: { bg: colors.danger, text: '#FFFFFF' },
  info: { bg: colors.accent, text: colors.onPrimary },
});

const SIZES: Record<BadgeSize, { dot: number; minWidth: number; height: number; fontSize: number }> = {
  sm: { dot: 8, minWidth: 16, height: 16, fontSize: 10 },
  md: { dot: 10, minWidth: 20, height: 20, fontSize: 11 },
  lg: { dot: 12, minWidth: 24, height: 24, fontSize: 13 },
};

function formatBadgeContent(content: string | number | undefined, max: number): string {
  if (content === undefined || content === null) return '';
  if (typeof content === 'number') {
    return content > max ? `${max}+` : `${content}`;
  }
  return content;
}

export function Badge({
  content,
  variant = 'danger',
  visible = true,
  max = 99,
  size = 'md',
  children,
  style,
  textStyle,
  offset,
}: BadgeProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  if (!visible) return <>{children}</>;

  const variants = getVariantColors(colors);
  const config = variants[variant] || variants.danger;
  const sizeSpec = SIZES[size] || SIZES.md;
  const isDot = content === undefined || content === null;
  const displayText = formatBadgeContent(content, max);

  const [offsetTop, offsetRight] = offset || [-6, -6];

  const badgeElement = (
    <View
      style={[
        styles.badgeBase,
        isDot
          ? {
              width: sizeSpec.dot,
              height: sizeSpec.dot,
              borderRadius: sizeSpec.dot / 2,
            }
          : {
              minWidth: sizeSpec.minWidth,
              height: sizeSpec.height,
              borderRadius: sizeSpec.height / 2,
              paddingHorizontal: 5,
            },
        { backgroundColor: config.bg },
        children
          ? [
              styles.anchoredBadge,
              {
                top: offsetTop,
                right: offsetRight,
              },
            ]
          : undefined,
        style,
      ]}
    >
      {!isDot && (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeSpec.fontSize,
              color: config.text,
            },
            textStyle,
          ]}
        >
          {displayText}
        </Text>
      )}
    </View>
  );

  if (!children) return badgeElement;

  return (
    <View style={styles.wrapper}>
      {children}
      {badgeElement}
    </View>
  );
}

export default Badge;

const useStyles = makeStyles((colors) => ({
  wrapper: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  badgeBase: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchoredBadge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.surface,
    zIndex: 10,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
}));
