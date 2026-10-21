import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles, spacing, typography } from '../../theme';

export const CATEGORY_EMOJIS = [
  '🍔', '☕', '🍜', '🛒', '🥗', '🍺', '🚌', '🚗', '⛽', '✈️',
  '🏠', '💡', '📱', '🌐', '👕', '🛍️', '💊', '🏥', '💇', '🏋️',
  '🎬', '🎮', '📚', '🎓', '🎁', '🐶', '👶', '🧾', '💼', '💰',
  '🔧', '🧹', '🎵', '🏖️', '🅿️', '🧴', '🏷️', '📦', '💳', '❤️',
];

interface EmojiGridProps {
  label?: string;
  value: string;
  onChange: (emoji: string) => void;
}

/** Tap-to-pick emoji grid for category icons. */
export function EmojiGrid({ label = 'Icon', value, onChange }: EmojiGridProps) {
  const styles = useStyles();
  // Keep an existing custom icon selectable even if it isn't in the curated list.
  const options = value && !CATEGORY_EMOJIS.includes(value) ? [value, ...CATEGORY_EMOJIS] : CATEGORY_EMOJIS;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map((e) => (
          <Pressable
            key={e}
            accessibilityRole="button"
            accessibilityLabel={`Icon ${e}`}
            accessibilityState={{ selected: e === value }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(e);
            }}
            style={[styles.cell, e === value && styles.cellActive]}
          >
            <Text style={styles.emoji}>{e}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: c.fill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellActive: { borderColor: c.textPrimary, backgroundColor: c.surface },
  emoji: { fontSize: 24 },
}));
