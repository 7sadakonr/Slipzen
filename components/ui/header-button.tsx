import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { typography, useTheme } from '../../theme';

/** Text button for native navigation headers (iOS 26 wraps it in a glass capsule, so it needs breathing room). */
export function HeaderButton({ title, onPress, bold }: { title: string; onPress: () => void; bold?: boolean }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
    >
      <Text style={{ color: colors.textPrimary, ...typography.body, fontWeight: bold ? '700' : '500' }}>{title}</Text>
    </TouchableOpacity>
  );
}
