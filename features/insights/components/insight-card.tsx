import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInsights } from '../hooks/use-insights';
import { spacing, typography, radius, makeStyles, useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export function InsightCard() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, refresh, isRefreshing } = useInsights();

  if (isLoading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="small" color={colors.textSecondary} />
        <Text style={styles.loadingText}>Analyzing spending patterns...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.card, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={24} color={colors.textMuted} />
        <Text style={styles.emptyText}>Couldn't load your insight right now.</Text>
        <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Try loading the insight again">
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <View style={[styles.card, styles.center]}>
        <Ionicons name="sparkles-outline" size={24} color={colors.textMuted} />
        <Text style={styles.emptyText}>Add a few more expenses and AI will summarise your spending.</Text>
      </View>
    );
  }

  const generatedAt = new Date(data.generated_at);
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={18} color={colors.accent} />
          <Text style={styles.title}>Insight</Text>
        </View>
        <TouchableOpacity
          onPress={() => refresh()}
          disabled={isRefreshing}
          style={styles.refreshBtn}
          accessibilityRole="button"
          accessibilityLabel="Refresh insight"
        >
          <Ionicons name="refresh" size={16} color={isRefreshing ? colors.textMuted : colors.textSecondary} />
          <Text style={[styles.refreshText, isRefreshing && { color: colors.textMuted }]}>{isRefreshing ? 'Updating…' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>AI summary of your recent spending</Text>
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

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    ...typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  retryText: { ...typography.subhead, color: colors.textPrimary, fontWeight: '600', marginTop: spacing.sm },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  refreshText: { ...typography.footnote, color: colors.textSecondary, fontWeight: '600' },
  subtitle: { ...typography.footnote, color: colors.textMuted, marginBottom: spacing.md },
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
    color: colors.textMuted,
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
}));
