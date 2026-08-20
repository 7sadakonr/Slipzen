import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/button';
import { colors, spacing, typography } from '../../theme';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  onAlternative?: { label: string; action: () => void };
}

export function ErrorView({ message, onRetry, onAlternative }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.danger} style={styles.icon} />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actions}>
        {onRetry && (
          <Button title="Try Again" onPress={onRetry} style={styles.button} />
        )}
        {onAlternative && (
          <Button 
            title={onAlternative.label} 
            variant="outline" 
            onPress={onAlternative.action} 
            style={styles.button} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    backgroundColor: colors.background,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  }
});
