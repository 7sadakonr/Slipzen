import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, spacing, typography } from '../../theme';

interface StepIndicatorProps {
  /** 1-based current step */
  step: number;
  total?: number;
  label: string;
  /** Use light-on-dark colors (over a photo or camera). */
  onDark?: boolean;
}

/** "Step 2 of 3 · Reading" with a segmented progress bar. */
export function StepIndicator({ step, total = 3, label, onDark }: StepIndicatorProps) {
  const styles = useStyles();
  return (
    <View accessible accessibilityLabel={`Step ${step} of ${total}: ${label}`} style={styles.wrap}>
      <View style={styles.bars}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              onDark && styles.barOnDark,
              i < step && (onDark ? styles.barActiveOnDark : styles.barActive),
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, onDark && { color: '#FFFFFF' }]}>
        Step {step} of {total} · {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.sm },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.fill },
  barActive: { backgroundColor: colors.textPrimary },
  barOnDark: { backgroundColor: 'rgba(255,255,255,0.25)' },
  barActiveOnDark: { backgroundColor: '#FFFFFF' },
  label: { ...typography.footnote, color: colors.textSecondary, fontWeight: '600' },
}));
