import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles, radius, spacing, typography } from '../../theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipSelectProps<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  value: T | '' | null | undefined;
  /** Tapping the selected chip again clears the selection. */
  onChange: (value: T | '') => void;
}

/** Single-choice chips, used instead of free-text for short fixed sets. */
export function ChipSelect<T extends string>({ label, options, value, onChange }: ChipSelectProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onChange(active ? '' : o.value);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const PAYMENT_METHODS: ChipOption<string>[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Card' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'e_wallet', label: 'E-wallet' },
  { value: 'other', label: 'Other' },
];

const useStyles = makeStyles((c) => ({
  container: { marginBottom: 16 },
  label: {
    ...typography.footnote,
    color: c.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: c.fill,
  },
  chipActive: { backgroundColor: c.primary },
  chipText: { ...typography.subhead, color: c.textSecondary, fontWeight: '600' },
  chipTextActive: { color: c.onPrimary },
}));
