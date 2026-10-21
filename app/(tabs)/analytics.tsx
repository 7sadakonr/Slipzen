import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { useAnalytics, DateRange } from '../../features/analytics/hooks/use-analytics';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { spacing, typography, radius, makeStyles, useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ErrorView } from '../../components/feedback/error-view';
import { EmptyState } from '../../components/feedback/empty-state';
import { AmountText, Skeleton, Appbar, Badge, BlurHeader } from '../../components/ui';

const RANGES: DateRange[] = ['7D', '30D', 'This Month', 'Last Month'];
const RANGE_LABELS: Record<DateRange, string> = {
  '7D': '7 days',
  '30D': '30 days',
  'This Month': 'This month',
  'Last Month': 'Last month',
};

export default function AnalyticsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const [headerH, setHeaderH] = useState(130);
  const [selectedRange, setSelectedRange] = useState<DateRange>('30D');
  const { data, isLoading, isError, refetch, isRefetching } = useAnalytics(selectedRange);
  const pieData = (data?.pieData ?? []).map((d: any, i: number) => ({
    ...d,
    color: colors.chart[i % colors.chart.length],
  }));

  const renderTrendBadge = (percentChange: number) => {
    if (percentChange === 0) return null;
    const isIncrease = percentChange > 0;
    return (
      <Badge
        content={`${isIncrease ? '↑' : '↓'} ${Math.abs(percentChange).toFixed(1)}%`}
        variant={isIncrease ? 'danger' : 'success'}
        size="md"
        style={{ marginRight: spacing.sm }}
      />
    );
  };

  return (
    <ScreenWrapper>
      <BlurHeader onHeight={setHeaderH}>
      <Appbar title="Analytics" />
      <View style={styles.rangeSelector}>
        {RANGES.map(r => (
          <TouchableOpacity 
            key={r}
            style={[styles.rangeBtn, selectedRange === r && styles.rangeBtnActive]}
            onPress={() => setSelectedRange(r)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedRange === r }}
          >
            <Text style={[styles.rangeBtnText, selectedRange === r && styles.rangeBtnTextActive]}>
              {RANGE_LABELS[r]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </BlurHeader>

      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingTop: headerH + spacing.md }]}
        scrollIndicatorInsets={{ top: headerH }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentInsetAdjustmentBehavior="automatic"
      >
        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.fullWidthCard]}>
                <Skeleton height={20} width={120} style={{ marginBottom: 12 }} />
                <Skeleton height={40} width={200} style={{ marginBottom: 16 }} />
                <Skeleton height={24} width={150} />
              </View>
              <View style={styles.summaryCard}>
                <Skeleton height={16} width={100} style={{ marginBottom: 12 }} />
                <Skeleton height={24} width={100} />
              </View>
              <View style={styles.summaryCard}>
                <Skeleton height={16} width={80} style={{ marginBottom: 12 }} />
                <Skeleton height={24} width={40} />
              </View>
            </View>
            <Skeleton height={300} width="100%" borderRadius={radius.xl} />
            <Skeleton height={300} width="100%" borderRadius={radius.xl} />
          </View>
        ) : isError ? (
          <ErrorView message="We couldn't load your analytics." onRetry={() => refetch()} />
        ) : (!data || data.summary.transaction_count === 0) ? (
          <EmptyState
            ionicon="pie-chart-outline"
            title="Nothing to chart yet"
            subtitle="No expenses in this period. Try a longer range or add an expense."
            action={{ label: 'Add expense', onPress: () => router.push('/add-actions') }}
          />
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.fullWidthCard]}>
                <Text style={styles.summaryLabel}>Total Spending</Text>
                <AmountText amount={data?.summary?.total_spending || 0} style={styles.totalAmount} />
                <View style={styles.trendRow}>
                  {data?.prevTotal === 0 ? (
                    <Text style={styles.trendLabel}>No data for previous period</Text>
                  ) : (
                    <>
                      {renderTrendBadge(data?.percentChange || 0)}
                      <Text style={styles.trendLabel}> vs previous period</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Daily Average</Text>
                <AmountText amount={data?.summary?.daily_average || 0} style={styles.summaryValue} />
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Transactions</Text>
                <Text style={styles.summaryValueText}>{data?.summary?.transaction_count || 0}</Text>
              </View>
            </View>

            {data?.pieData && data.pieData.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={100}
                    innerRadius={68}
                    innerCircleColor={colors.surface}
                    strokeWidth={2}
                    strokeColor={colors.surface}
                  />
                </View>
                <View style={styles.legendContainer}>
                  {pieData.map((item, idx) => (
                    <View key={idx} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.text} {item.label}</Text>
                      <AmountText amount={item.value} style={styles.legendValue} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {data?.barData && data.barData.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Daily Spending</Text>
                <View style={styles.barChartContainer}>
                  <BarChart
                    data={data.barData.map((d: any) => ({ ...d, frontColor: colors.accent }))}
                    barWidth={18}
                    spacing={12}
                    roundedTop
                    roundedBottom
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                    noOfSections={4}
                    maxValue={Math.max(...data.barData.map(d => d.value)) * 1.2 || 100}
                    hideRules
                  />
                </View>
              </View>
            )}

            {data?.topMerchants && data.topMerchants.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Merchants</Text>
                {data.topMerchants.map((m, idx) => (
                  <View key={idx} style={styles.merchantRow}>
                    <View style={styles.merchantLeft}>
                      <View style={styles.merchantRankBadge}>
                        <Text style={styles.merchantRankText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.merchantInfo}>
                        <Text style={styles.merchantName} numberOfLines={1}>{m.merchant}</Text>
                        <Text style={styles.merchantVisits}>{m.count} visits</Text>
                      </View>
                    </View>
                    <AmountText amount={m.total} style={styles.merchantTotal} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((colors) => ({
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  center: {
    padding: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.danger,
    ...typography.body,
  },
  rangeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 3,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  rangeBtnActive: {
    backgroundColor: colors.surface,
  },
  rangeBtnText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  rangeBtnTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fullWidthCard: {
    width: '100%',
  },
  summaryLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  summaryValue: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  summaryValueText: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  trendLabel: {
    ...typography.caption1,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  barChartContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  legendText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  legendValue: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  merchantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  merchantRankText: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  merchantName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  merchantVisits: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  merchantTotal: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 0,
  }
}));
