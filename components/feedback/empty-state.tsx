import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/button';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: string;
  ionicon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, ionicon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {ionicon ? (
        <Ionicons name={ionicon} size={64} color={colors.textMuted} style={styles.icon} />
      ) : icon ? (
        <Text style={styles.iconText}>{icon}</Text>
      ) : null}
      
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button 
          title={action.label} 
          onPress={action.onPress} 
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 160,
  }
});
