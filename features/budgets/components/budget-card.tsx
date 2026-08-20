import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../../utils/format';
import { colors, spacing, typography, radius, shadows } from '../../../theme';
import { BudgetStatus } from '../hooks/use-budget-status';

interface BudgetCardProps {
  budget: BudgetStatus;
  currency: string;
  onPress?: () => void;
}

export function BudgetCard({ budget, currency, onPress }: BudgetCardProps) {
  const isDanger = budget.percentage >= 100;
  const isWarning = budget.percentage >= 80 && !isDanger;
  
  const barColor = isDanger ? colors.danger : isWarning ? colors.warning : colors.primary;

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={onPress ? 0.7 : 1} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {budget.categoryIcon && <Text style={styles.icon}>{budget.categoryIcon}</Text>}
          <Text style={styles.title}>{budget.categoryName}</Text>
        </View>
        <Text style={styles.percentage}>{budget.percentage}%</Text>
      </View>

      <View style={styles.amountsRow}>
        <Text style={styles.spent}>{formatCurrency(budget.spent, currency)}</Text>
        <Text style={styles.limit}> / {formatCurrency(budget.limit, currency)}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${budget.percentage}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Remaining</Text>
          <Text style={[styles.footerValue, isDanger && styles.textDanger]}>
            {formatCurrency(budget.remaining, currency)}
          </Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.footerLabel}>Projected</Text>
          <Text style={styles.footerValue}>
            {formatCurrency(budget.projected, currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  percentage: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  spent: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  limit: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  footerValue: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  textDanger: {
    color: colors.danger,
  }
});
