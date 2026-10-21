import React from 'react';
import { useRouter } from 'expo-router';
import { SectionList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useTransactions, TransactionFilters } from '../hooks/use-transactions';
import { TransactionCard } from './transaction-card';
import { EmptyState } from '../../../components/feedback/empty-state';
import { ErrorView } from '../../../components/feedback/error-view';
import { Skeleton } from '../../../components/ui/skeleton';
import { spacing, typography, radius, makeStyles, useTheme } from '../../../theme';

export function TransactionList({ filters, topInset = 0 }: { filters?: TransactionFilters; topInset?: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch
  } = useTransactions(filters);

  if (isLoading) {
    return (
      <View style={[styles.skeletonContainer, { paddingTop: topInset + 12 }]}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={styles.skeletonRow}>
            <View style={styles.skeletonLeft}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.skeletonText}>
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
              </View>
            </View>
            <Skeleton width={60} height={18} />
          </View>
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, paddingTop: topInset }}>
      <ErrorView 
        message={(error as any)?.message || 'Failed to load transactions.'} 
        onRetry={refetch}
      />
      </View>
    );
  }

  const transactions = data?.pages.flatMap(page => page) || [];

  if (!data || data.pages[0].length === 0) {
    return (
      <View style={{ flex: 1, paddingTop: topInset }}>
      <EmptyState 
        ionicon="receipt-outline" 
        title="No Transactions" 
        subtitle={filters?.search || filters?.categoryId ? "No transactions match your filters." : "Add an expense or scan a receipt to get started."}
        action={filters?.search || filters?.categoryId ? undefined : { label: 'Add expense', onPress: () => router.push('/add-actions') }}
      />
      </View>
    );
  }

  // Group by calendar day (list is already ordered newest first)
  const sections: { title: string; data: any[] }[] = [];
  transactions.forEach((tx: any) => {
    const date = new Date(tx.transaction_date);
    const title = isToday(date)
      ? 'Today'
      : isYesterday(date)
        ? 'Yesterday'
        : format(date, 'EEE, d MMM yyyy');
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.data.push(tx);
    else sections.push({ title, data: [tx] });
  });

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }) => <TransactionCard transaction={item} />}
      renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={styles.summary}>
          <Text style={styles.summaryCount}>
            {transactions.length}{hasNextPage ? '+' : ''} {transactions.length === 1 ? 'expense' : 'expenses'}
          </Text>
          <Text style={styles.summaryHint}>Tap to view · swipe left to delete</Text>
        </View>
      }
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.listContent, { paddingTop: topInset }]}
      scrollIndicatorInsets={{ top: topInset }}
      contentInsetAdjustmentBehavior="automatic"
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </View>
        ) : null
      }
    />
  );
}

const useStyles = makeStyles((colors) => ({
  summary: { paddingTop: spacing.sm, paddingHorizontal: spacing.xs },
  summaryCount: { ...typography.headline, color: colors.textPrimary },
  summaryHint: { ...typography.footnote, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  listContent: {
    marginHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonText: {
    marginLeft: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  }
}));
