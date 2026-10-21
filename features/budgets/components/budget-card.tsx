import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../../utils/format';
import { spacing, typography, radius, makeStyles, useTheme } from '../../../theme';
import { BudgetStatus } from '../hooks/use-budget-status';

interface BudgetCardProps {
  budget: BudgetStatus;
  currency: string;
  onPress?: () => void;
}

export function BudgetCard({ budget, currency, onPress }: BudgetCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isDanger = budget.percentage >= 100;
  const isWarning = budget.percentage >= 80 && !isDanger;
  
  const barColor = isDanger ? colors.danger : isWarning ? colors.warning : colors.textPrimary;

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
          <Text style={styles.title} numberOfLines={1}>{budget.categoryName}</Text>
        </View>
        <View style={styles.percentRow}>
          <Text style={styles.percentage}>{budget.percentage}% used</Text>
          {onPress ? <Ionicons name="chevron-forward" size={14} color={colors.textMuted} /> : null}
        </View>
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
          <Text style={styles.footerLabel}>Left this month</Text>
          <Text style={[styles.footerValue, isDanger && styles.textDanger]}>
            {formatCurrency(budget.remaining, currency)}
          </Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.footerLabel}>On pace for</Text>
          <Text style={styles.footerValue}>
            {formatCurrency(budget.projected, currency)}
          </Text>
        </View>
      </View>
      {onPress ? <Text style={styles.hint}>Estimated month-end spend at your current pace · tap to edit</Text> : null}
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    flex: 1,
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  percentRow: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 },
  hint: { ...typography.caption1, color: colors.textMuted, marginTop: spacing.md },
  percentage: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 0,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  spent: {
    ...typography.title2,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  limit: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.fill,
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
}));
