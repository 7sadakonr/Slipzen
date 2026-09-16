import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { Button } from '../../components/ui/button';
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
import { SlipzenLogo } from '../../components/ui/slipzen-logo';

export default function DashboardScreen() {
  const router = useRouter();
  
  const now = new Date();
  
  const { data: profile } = useProfile();
  const currency = profile?.currency || 'THB';
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats(year, now.getMonth());
  const { data: budgets, isLoading: budgetsLoading } = useBudgetStatus(month, year);

  const overallBudget = budgets?.find(b => b.isOverall);

  const isLoading = statsLoading || budgetsLoading;

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo */}
        <View style={styles.headerTitleRow}>
          <SlipzenLogo width={120} height={36} color={colors.textPrimary} />
        </View>

        {/* Primary Budget / Spending Card */}
        <View style={styles.mainCard}>
          <View style={styles.spendingHeaderRow}>
            <Text style={styles.mainCardLabel}>Total Spending</Text>
            <Text style={styles.mainCardLabel}>This Month</Text>
          </View>

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
                      backgroundColor: colors.textPrimary 
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

        {/* AI Insight Card */}
        <InsightCard />

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={{ gap: spacing.md, marginTop: spacing.md, marginBottom: spacing['2xl'] }}>
            <Skeleton height={200} width="100%" borderRadius={radius.xl} />
          </View>
        )}

        {!isLoading && stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <View style={styles.listCard}>
            {stats.recentTransactions.map((tx: any, idx: number) => {
              const bgColors = ['#FFF4E5', '#F3F0FF', '#E8F5E9', '#E3F2FD', '#FCE4EC'];
              const bgColor = bgColors[idx % bgColors.length];
              const isLast = idx === stats.recentTransactions.length - 1;
              return (
                <View key={idx}>
                  <View style={styles.listRow}>
                    <View style={[styles.listIconWrapper, { backgroundColor: bgColor }]}>
                      <Text style={styles.listIcon}>{(tx.categories as any)?.icon || '💸'}</Text>
                    </View>
                    <View style={styles.listBody}>
                      <View style={styles.listBodyTop}>
                        <Text style={styles.listTitle} numberOfLines={1}>{tx.merchant}</Text>
                        <Text style={styles.listAmount}>{formatCurrency(parseFloat(tx.amount), currency)}</Text>
                      </View>
                      <Text style={styles.listSubtitle}>{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</Text>
                    </View>
                  </View>
                  {!isLast && <View style={styles.listDivider} />}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Top Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            <Skeleton height={200} width="100%" borderRadius={radius.xl} />
          </View>
        )}
        
        {stats?.topCategories.length === 0 && !isLoading && (
          <View style={styles.listCard}>
            <EmptyState 
              ionicon="receipt-outline" 
              title="No expenses" 
              subtitle="Add an expense to see your categories." 
            />
          </View>
        )}
        
        {!isLoading && stats?.topCategories && stats.topCategories.length > 0 && (
          <View style={styles.listCard}>
            {stats.topCategories.map((cat: any, idx: number) => {
              const budget = budgets?.find(b => !b.isOverall && b.categoryName === cat.name);
              const bgColors = ['#FFF4E5', '#F3F0FF', '#E8F5E9', '#E3F2FD', '#FCE4EC'];
              const bgColor = bgColors[idx % bgColors.length];
              const isLast = idx === stats.topCategories.length - 1;
              
              return (
                <View key={idx}>
                  <View style={styles.listRow}>
                    <View style={[styles.listIconWrapper, { backgroundColor: bgColor }]}>
                      <Text style={styles.listIcon}>{cat.icon}</Text>
                    </View>
                    <View style={styles.listBody}>
                      <View style={styles.listBodyTop}>
                        <View style={styles.listTitleWrapper}>
                          <Text style={styles.listTitle} numberOfLines={1}>{cat.name}</Text>
                          {budget && (
                            <View style={styles.budgetPill}>
                              <Text style={styles.budgetPillText}>BUDGETED</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.listAmount}>{formatCurrency(cat.total, currency)}</Text>
                      </View>
                      {budget && (
                        <View style={styles.catProgressBarContainer}>
                          <View style={[styles.catProgressBar, { width: `${Math.min(budget.percentage, 100)}%` }]} />
                        </View>
                      )}
                    </View>
                  </View>
                  {!isLast && <View style={styles.listDivider} />}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  headerTitleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.md,
  },
  mainCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing['2xl'],
    ...shadows.md,
  },
  spendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mainCardLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mainAmount: {
    ...typography.largeTitle,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  budgetRow: {
    paddingTop: spacing.sm,
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
    fontWeight: '600',
  },
  budgetValue: {
    ...typography.headline,
    fontWeight: '800',
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
    color: colors.textSecondary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  seeAll: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing['2xl'],
    ...shadows.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 64, // 48 (icon width) + 16 (margin right)
  },
  listIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listIcon: {
    fontSize: 24,
  },
  listBody: {
    flex: 1,
    justifyContent: 'center',
  },
  listBodyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.md,
  },
  listTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  listAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  budgetPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  budgetPillText: {
    ...typography.caption2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  catProgressBarContainer: {
    height: 6, // Slightly thicker like the wireframe
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginTop: 2,
  },
  catProgressBar: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
});
