import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInsights } from '../hooks/use-insights';
import { colors, spacing, typography, radius, shadows } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export function InsightCard() {
  const { data, isLoading, isError, refresh, isRefreshing } = useInsights();

  if (isLoading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing spending patterns...</Text>
      </View>
    );
  }

  if (isError || !data || data.content.length === 0) {
    return (
      <View style={[styles.card, styles.center]}>
        <Ionicons name="sparkles-outline" size={24} color={colors.textMuted} />
        <Text style={styles.emptyText}>Add more transactions to get AI insights.</Text>
      </View>
    );
  }

  const generatedAt = new Date(data.generated_at);
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={18} color={colors.warning} />
          <Text style={styles.title}>AI Insight</Text>
        </View>
        <TouchableOpacity onPress={() => refresh()} disabled={isRefreshing}>
          <Ionicons name="refresh" size={18} color={isRefreshing ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {data.content.map((insight: string, idx: number) => (
          <View key={idx} style={styles.insightRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          Updated {formatDistanceToNow(generatedAt, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.subhead,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  content: {
    gap: spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timestamp: {
    ...typography.caption2,
    color: colors.textMuted,
  },
});
