import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { useBudgetStatus } from '../../features/budgets/hooks/use-budget-status';
import { BudgetCard } from '../../features/budgets/components/budget-card';
import { spacing, typography, radius, shadows, makeStyles, useTheme } from '../../theme';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { useAvailableMonths } from '../../features/transactions/hooks/use-available-months';
import { startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';

import { Skeleton } from '../../components/ui/skeleton';
import { Glass } from '../../components/ui/glass';
import { EmptyState } from '../../components/feedback/empty-state';

export default function BudgetOverviewScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: availableMonths = [] } = useAvailableMonths();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const { data: budgets, isLoading, refetch, isRefetching } = useBudgetStatus(month, year);
  
  const currency = profile?.currency || 'THB';

  const currentMonthStart = startOfMonth(currentDate).getTime();
  const currentIndex = availableMonths.findIndex(d => d.getTime() === currentMonthStart);
  
  const canGoPrev = currentIndex >= 0 && currentIndex < availableMonths.length - 1;
  const canGoNext = currentIndex > 0;

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setCurrentDate(availableMonths[currentIndex + 1]);
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    setCurrentDate(availableMonths[currentIndex - 1]);
  };

  const overallBudget = budgets?.find(b => b.isOverall);
  const categoryBudgets = budgets?.filter(b => !b.isOverall) || [];

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.monthSelector}>
          <Skeleton height={24} width={24} />
          <Skeleton height={24} width={120} />
          <Skeleton height={24} width={24} />
        </View>
        <View style={styles.list}>
          <Skeleton height={20} width={120} style={{ marginBottom: spacing.md }} />
          <Skeleton height={140} width="100%" borderRadius={radius.lg} style={{ marginBottom: spacing.xl }} />
          <Skeleton height={20} width={150} style={{ marginBottom: spacing.md }} />
          <Skeleton height={100} width="100%" borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
          <Skeleton height={100} width="100%" borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth} style={[styles.monthBtn, !canGoPrev && { opacity: 0.3 }]} disabled={!canGoPrev}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>{format(currentDate, 'MMMM yyyy')}</Text>
        
        <TouchableOpacity onPress={handleNextMonth} style={[styles.monthBtn, !canGoNext && { opacity: 0.3 }]} disabled={!canGoNext}>
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categoryBudgets}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Overall Budget</Text>
            {overallBudget ? (
              <BudgetCard 
                budget={overallBudget} 
                currency={currency} 
                onPress={() => router.push({ pathname: '/budget/set', params: { id: overallBudget.id, month, year } })}
              />
            ) : (
              <TouchableOpacity 
                style={styles.emptyCard}
                onPress={() => router.push({ pathname: '/budget/set', params: { type: 'overall', month, year } })}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="wallet-outline" size={28} color={colors.textPrimary} />
                </View>
                <Text style={styles.emptyTitle}>Set Overall Budget</Text>
                <Text style={styles.emptySubtitle}>Track your total spending limit for the month</Text>
              </TouchableOpacity>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Category Budgets</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <BudgetCard 
            budget={item} 
            currency={currency} 
            onPress={() => router.push({ pathname: '/budget/set', params: { id: item.id, month, year } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <EmptyState 
              ionicon="pie-chart-outline" 
              title="No Category Budgets" 
              subtitle="Set limits for specific categories like Food or Transport."
              action={{
                label: 'Add category budget',
                onPress: () => router.push({ pathname: '/budget/set', params: { type: 'category', month, year } }),
              }}
            />
          </View>
        }
      />

      <Glass isInteractive tintColor={colors.primary} style={styles.fabGlass}>
        <TouchableOpacity 
          style={styles.fabTouchable}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add category budget"
          onPress={() => router.push({ pathname: '/budget/set', params: { type: 'category', month, year } })}
        >
          <Ionicons name="add" size={22} color={colors.onPrimary} />
          <Text style={styles.fabLabel}>Add budget</Text>
        </TouchableOpacity>
      </Glass>
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((colors) => ({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthBtn: {
    padding: spacing.xs,
  },
  monthText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  fabGlass: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing['2xl'],
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  fabLabel: { ...typography.headline, color: colors.onPrimary },
  fabTouchable: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: colors.onPrimary,
    fontWeight: '300',
    marginTop: -2,
  },
}));
