import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { Button } from '../../components/ui/button';
import { MonthPicker } from '../../components/ui/month-picker';
import { useDashboardStats } from '../../features/transactions/hooks/use-dashboard-stats';
import { useBudgetStatus } from '../../features/budgets/hooks/use-budget-status';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { format } from 'date-fns';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';
import { InsightCard } from '../../features/insights/components/insight-card';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/feedback/empty-state';

export default function DashboardScreen() {
  const router = useRouter();
  const [filterDate, setFilterDate] = useState(new Date());
  
  const { data: profile } = useProfile();
  const currency = profile?.currency || 'THB';
  const month = filterDate.getMonth() + 1;
  const year = filterDate.getFullYear();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats(year, filterDate.getMonth());
  const { data: budgets, isLoading: budgetsLoading } = useBudgetStatus(month, year);

  const overallBudget = budgets?.find(b => b.isOverall);
  
  // Greeting logic
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  
  const displayName = profile?.display_name?.split(' ')[0] || 'User';

  const isLoading = statsLoading || budgetsLoading;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Month Selector */}
        <MonthPicker 
          currentDate={filterDate} 
          onChange={setFilterDate} 
        />

        {/* Header Greeting */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.greeting}>{greeting}, {displayName}</Text>
        </View>

        {/* Primary Budget / Spending Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Total Spending</Text>
          {isLoading ? (
            <View style={{ gap: spacing.md, marginVertical: spacing.md }}>
              <Skeleton height={40} width="60%" />
              <Skeleton height={20} width="100%" />
            </View>
          ) : (
            <Text style={styles.mainAmount}>
              {formatCurrency(stats?.total || 0, currency)}
            </Text>
          )}

          {!isLoading && overallBudget && (
            <View style={styles.budgetRow}>
              <View style={styles.budgetLabels}>
                <Text style={styles.budgetLabel}>Budget Remaining</Text>
                <Text style={styles.budgetValue}>{formatCurrency(overallBudget.remaining, currency)}</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.min(overallBudget.percentage, 100)}%`, 
                      backgroundColor: overallBudget.percentage >= 100 ? colors.danger : overallBudget.percentage >= 80 ? colors.warning : colors.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.budgetPercentage}>{overallBudget.percentage}%</Text>
            </View>
          )}
          
          {!isLoading && !overallBudget && (
            <TouchableOpacity style={styles.setBudgetBtn} onPress={() => router.push('/budget')}>
              <Text style={styles.setBudgetBtnText}>+ Set Overall Budget</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 7-Day Spending Trend Mini Chart */}
        {!isLoading && stats?.trend && stats.trend.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending Trend</Text>
            <View style={styles.trendContainer}>
              {stats.trend.map((day, idx) => {
                const maxDay = Math.max(...stats.trend.map(d => d.total));
                const height = maxDay > 0 ? (day.total / maxDay) * 100 : 0;
                return (
                  <View key={idx} style={styles.trendBarWrap}>
                    <View style={styles.trendBarBg}>
                      <View style={[styles.trendBarFill, { height: `${height}%` }]} />
                    </View>
                    <Text style={styles.trendDayLabel}>{format(day.date, 'dd')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* AI Insight Card */}
        <InsightCard />

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading && (
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              <Skeleton height={50} width="100%" />
              <Skeleton height={50} width="100%" />
              <Skeleton height={50} width="100%" />
            </View>
          )}
          
          {stats?.topCategories.length === 0 && !isLoading && (
            <EmptyState 
              ionicon="receipt-outline" 
              title="No expenses this month" 
              subtitle="Add an expense to see your categories." 
            />
          )}
          
          {stats?.topCategories.map((cat: any, idx: number) => (
            <View key={idx} style={styles.categoryRow}>
              <View style={styles.catLeft}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
              <Text style={styles.categoryTotal}>{formatCurrency(cat.total, currency)}</Text>
            </View>
          ))}
        </View>
        
        {/* Quick Add Button */}
        <View style={styles.actions}>
          <Button 
            title="+ Add Expense" 
            onPress={() => router.push('/expense/add')}
            style={styles.addButton}
          />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: spacing.xl, paddingBottom: 40 },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  monthLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mainCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing['2xl'],
    ...shadows.md,
  },
  mainCardLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mainAmount: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  budgetRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  budgetValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
  budgetPercentage: {
    ...typography.caption2,
    color: colors.textMuted,
    textAlign: 'right',
  },
  setBudgetBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.md,
  },
  setBudgetBtnText: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing['2xl'],
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginTop: spacing.sm,
  },
  trendBarWrap: {
    alignItems: 'center',
    width: 30,
  },
  trendBarBg: {
    height: 60,
    width: 12,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  trendDayLabel: {
    ...typography.caption2,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  catIcon: {
    fontSize: 24,
  },
  categoryName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  categoryTotal: {
    ...typography.headline,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  actions: {
    marginBottom: spacing['3xl'],
  },
  addButton: {
    width: '100%',
  },
});
