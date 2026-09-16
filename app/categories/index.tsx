import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategories } from '../../features/categories/hooks/use-categories';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorView } from '../../components/feedback/error-view';
import { EmptyState } from '../../components/feedback/empty-state';
import { GlassView } from 'expo-glass-effect';

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.list}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.card}>
              <View style={styles.cardLeft}>
                <Skeleton width={48} height={48} borderRadius={24} />
                <View style={{ gap: 6 }}>
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </View>
              </View>
              <Skeleton width={20} height={20} />
            </View>
          ))}
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <ErrorView message="Failed to load categories." />
      </ScreenWrapper>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    // Count transactions from the nested query result
    const txCount = item.transactions?.[0]?.count || 0;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/categories/edit',
          params: { id: item.id }
        })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon || '🏷️'}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardRight}>
          {item.ai_generated && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ AI</Text>
            </View>
          )}
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <EmptyState 
              ionicon="pricetags-outline" 
              title="No Categories" 
              subtitle="Create your first category." 
            />
          </View>
        }
      />

      <GlassView isInteractive tintColor="rgba(0, 0, 0, 0.9)" style={styles.fabGlass}>
        <TouchableOpacity 
          style={styles.fabTouchable}
          activeOpacity={0.7}
          onPress={() => router.push('/categories/add')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </GlassView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  details: {
    justifyContent: 'center',
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  meta: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.aiSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.caption2,
    color: colors.aiAccent,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  emptyState: {
    padding: spacing['3xl'],
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
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
