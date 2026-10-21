import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Glass } from './glass';
import { useToastStore } from '../../lib/toast-store';
import { makeStyles, spacing, typography, useTheme } from '../../theme';

const ICONS = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
} as const;

/** Global toast. Mount once near the root; trigger with `toast.success('Saved')`. */
export function ToastHost() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id, message, kind } = useToastStore();

  if (!message) return null;

  const iconColor = kind === 'error' ? colors.danger : colors.textPrimary;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.sm }]}>
      <Animated.View key={id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)}>
        <Glass style={styles.pill}>
          <Ionicons name={ICONS[kind]} size={20} color={iconColor} />
          <Text style={styles.text} numberOfLines={2}>
            {message}
          </Text>
        </Glass>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    overflow: 'hidden',
    maxWidth: 420,
  },
  text: { ...typography.subhead, fontWeight: '600', color: colors.textPrimary, flexShrink: 1 },
}));
