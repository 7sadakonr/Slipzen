import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { Skeleton, SlipzenLogo, Appbar, Avatar, Banner, Badge, Glass, ListGroup, ListRow, GraphiteCard, BlurHeader } from '../../components/ui';
import { useDashboardStats } from '../../features/transactions/hooks/use-dashboard-stats';
import { useBudgetStatus } from '../../features/budgets/hooks/use-budget-status';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { format } from 'date-fns';
import { typography, spacing, radius, makeStyles, useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';
import { InsightCard } from '../../features/insights/components/insight-card';
import { EmptyState } from '../../components/feedback/empty-state';
import { useNotifications } from '../../features/notifications/hooks/use-notifications';

export default function DashboardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  
  const now = new Date();
  
  const { data: profile } = useProfile();
  const currency = profile?.currency || 'THB';
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats(year, now.getMonth());
  const { data: budgets, isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgetStatus(month, year);
  const [refreshing, setRefreshing] = useState(false);
  const [headerH, setHeaderH] = useState(110);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchBudgets()]);
    } finally {
      setRefreshing(false);
    }
  };

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile?.display_name || '').split(' ')[0];
  const { hasUnread } = useNotifications(month, year);

  const overallBudget = budgets?.find(b => b.isOverall);

  const isLoading = statsLoading || budgetsLoading;

  const handleOpenNotifications = () => router.push('/notifications');

  return (
    <ScreenWrapper>
      <BlurHeader onHeight={setHeaderH}>
      <Appbar
          leading={
            <Avatar
              name={profile?.display_name || profile?.email || 'User'}
              imageUri={profile?.avatar_url || undefined}
              size="sm"
              onPress={() => router.push('/profile')}
            />
          }
          title={<SlipzenLogo width={110} height={32} color={colors.textPrimary} />}
          centerTitle
          trailing={
            <TouchableOpacity
              onPress={handleOpenNotifications}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={hasUnread ? 'Notifications, unread' : 'Notifications'}
            >
              <Badge variant="danger" size="sm" visible={hasUnread}>
                <Glass isInteractive style={styles.glassCircle}>
                  <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                </Glass>
              </Badge>
            </TouchableOpacity>
          }
        />
      </BlurHeader>
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingTop: headerH + spacing.md }]}
        scrollIndicatorInsets={{ top: headerH }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingText}>{greeting}{firstName ? `, ${firstName}` : ''}</Text>
          <Text style={styles.greetingDate}>{format(now, 'EEEE, d MMMM')}</Text>
        </View>

        {/* Budget Alert Banner */}
        {!isLoading && overallBudget && overallBudget.percentage >= 80 && (
          <Banner
            variant={overallBudget.percentage >= 100 ? 'error' : 'warning'}
            title={overallBudget.percentage >= 100 ? 'Budget Exceeded!' : 'Budget Warning'}
            message={`You have used ${overallBudget.percentage}% of your monthly overall budget.`}
            action={{ label: 'View', onPress: () => router.push('/budget') }}
            dismissable
            style={{ marginBottom: spacing.lg }}
          />
        )}

        {/* Primary Budget / Spending Card */}
        <GraphiteCard style={styles.mainCard}>
          <View style={styles.spendingHeaderRow}>
            <SlipzenLogo width={64} height={19} color="rgba(255,255,255,0.7)" />
            <TouchableOpacity onPress={() => router.push('/budget')} accessibilityRole="button" accessibilityLabel="Open budgets">
              <Text style={styles.mainCardLabel}>Budgets ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.mainCardLabel, styles.totalLabel]}>Total spending · This month</Text>

          {isLoading ? (
             <View style={{ gap: spacing.md, marginVertical: spacing.md }}>
               <Skeleton height={40} width="60%" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
               <Skeleton height={20} width="100%" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
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
                      backgroundColor: '#FFFFFF' 
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
        </GraphiteCard>

        {/* First-run guidance */}
        {!isLoading && (!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
          <ListGroup title="Get started" style={{ marginBottom: spacing['2xl'] }}>
            <ListRow
              icon="scan-outline"
              title="Scan your first receipt"
              subtitle="Take a photo and AI fills in the details"
              chevron
              onPress={() => router.push('/scan')}
            />
            <ListRow
              icon="wallet-outline"
              title="Set a monthly budget"
              subtitle="Get alerts before you overspend"
              chevron
              onPress={() => router.push('/budget')}
            />
            <ListRow
              icon="pricetags-outline"
              title="Review your categories"
              subtitle="Rename or add your own"
              chevron
              onPress={() => router.push('/categories')}
            />
          </ListGroup>
        )}

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
              const isLast = idx === stats.recentTransactions.length - 1;
              return (
                <View key={idx}>
                  <TouchableOpacity
                    style={styles.listRow}
                    activeOpacity={0.6}
                    onPress={() => router.push(`/expense/${tx.id}`)}
                  >
                    <View style={styles.listIconWrapper}>
                      <Text style={styles.listIcon}>{(tx.categories as any)?.icon || '•'}</Text>
                    </View>
                    <View style={styles.listBody}>
                      <View style={styles.listBodyTop}>
                        <Text style={[styles.listTitle, styles.recentTxTitle]} numberOfLines={1}>{tx.merchant}</Text>
                        <Text style={styles.listAmount}>{formatCurrency(parseFloat(tx.amount), currency)}</Text>
                      </View>
                      <Text style={styles.listSubtitle}>{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</Text>
                    </View>
                  </TouchableOpacity>
                  {!isLast && <View style={styles.listDivider} />}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Top Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity onPress={() => router.push('/analytics')}>
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
              const isLast = idx === stats.topCategories.length - 1;
              
              return (
                <View key={idx}>
                  <View style={styles.listRow}>
                    <View style={styles.listIconWrapper}>
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

const useStyles = makeStyles((colors) => ({
  greetingBlock: {
    marginBottom: spacing.xl,
  },
  greetingText: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  greetingDate: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  glassCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scrollContainer: { 
    padding: spacing.xl,
    paddingBottom: 120,
  },
  mainCard: {
    marginBottom: spacing['2xl'],
  },
  spendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: { marginBottom: 2 },
  mainCardLabel: {
    ...typography.footnote,
    color: '#FFFFFF',
    opacity: 0.65,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  mainAmount: {
    ...typography.amount,
    fontSize: 44,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
    ...typography.footnote,
    color: '#FFFFFF',
    opacity: 0.65,
    fontWeight: '600',
  },
  budgetValue: {
    ...typography.headline,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
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
    color: '#FFFFFF',
    opacity: 0.65,
    textAlign: 'right',
  },
  setBudgetBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    marginTop: spacing.md,
  },
  setBudgetBtnText: {
    ...typography.subhead,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 56, // 44 (icon width) + 12 (margin right)
  },
  listIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.fill,
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
    flexShrink: 1,
  },
  recentTxTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  listSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  listAmount: {
    ...typography.body,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
    flexShrink: 0,
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
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginTop: 2,
  },
  catProgressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
}));
