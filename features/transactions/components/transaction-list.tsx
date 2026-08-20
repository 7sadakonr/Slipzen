import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTransactions, TransactionFilters } from '../hooks/use-transactions';
import { TransactionCard } from './transaction-card';
import { EmptyState } from '../../../components/feedback/empty-state';
import { ErrorView } from '../../../components/feedback/error-view';
import { Skeleton } from '../../../components/ui/skeleton';
import { colors, spacing, typography, radius } from '../../../theme';

export function TransactionList({ filters }: { filters?: TransactionFilters }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useTransactions(filters);

  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
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
      <ErrorView 
        message={(error as any)?.message || 'Failed to load transactions.'} 
        onRetry={refetch}
      />
    );
  }

  const transactions = data?.pages.flatMap(page => page) || [];

  if (!data || data.pages[0].length === 0) {
    return (
      <EmptyState 
        ionicon="receipt-outline" 
        title="No Transactions" 
        subtitle={filters?.search || filters?.categoryId ? "No transactions match your filters." : "Add an expense or scan a receipt to get started."} 
      />
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionCard transaction={item} />}
      contentContainerStyle={styles.listContent}
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
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
});
