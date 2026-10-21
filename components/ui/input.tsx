import React, { forwardRef, useState } from 'react';
import { View, TextInput, Text, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles, radius, typography, useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Element shown at the trailing edge, e.g. a show/hide password button. */
  rightAccessory?: React.ReactNode;
  /** Adds a show/hide button for password fields (use with secureTextEntry). */
  secureToggle?: boolean;
}

const useStyles = makeStyles((c) => ({
  container: { marginBottom: 16 },
  label: {
    ...typography.footnote,
    color: c.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: 14,
  },
  focused: { borderColor: c.accent },
  invalid: { borderColor: c.danger },
  input: { flex: 1, minHeight: 52, paddingVertical: 0, fontSize: 16, color: c.textPrimary },
  errorText: { color: c.danger, fontSize: 12, marginTop: 4 },
}));

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, rightAccessory, secureToggle, secureTextEntry, onFocus, onBlur, ...props },
  ref
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, focused && styles.focused, !!error && styles.invalid]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          secureTextEntry={secureTextEntry && !revealed}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : (
          rightAccessory
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});
