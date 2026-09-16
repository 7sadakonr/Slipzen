import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { useAnalytics, DateRange } from '../../features/analytics/hooks/use-analytics';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { AmountText } from '../../components/ui/amount-text';
import { Skeleton } from '../../components/ui/skeleton';

const RANGES: DateRange[] = ['7D', '30D', 'This Month', 'Last Month'];

export default function AnalyticsScreen() {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30D');
  const { data, isLoading, isError } = useAnalytics(selectedRange);

  const renderTrendBadge = (percentChange: number) => {
    if (percentChange === 0) return null;
    const isIncrease = percentChange > 0;
    const color = isIncrease ? colors.danger : colors.success;
    const icon = isIncrease ? 'trending-up' : 'trending-down';
    return (
      <View style={[styles.trendBadge, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.trendText, { color }]}>
          {Math.abs(percentChange).toFixed(1)}%
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.rangeSelector}>
        {RANGES.map(r => (
          <TouchableOpacity 
            key={r}
            style={[styles.rangeBtn, selectedRange === r && styles.rangeBtnActive]}
            onPress={() => setSelectedRange(r)}
          >
            <Text style={[styles.rangeBtnText, selectedRange === r && styles.rangeBtnTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
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
          <View style={styles.center}>
            <Text style={styles.errorText}>Failed to load analytics</Text>
          </View>
        ) : (!data || data.summary.transaction_count === 0) ? (
          <View style={{ marginTop: spacing['3xl'] }}>
            <Text style={{ textAlign: 'center', color: colors.textSecondary }}>Not enough data for this period.</Text>
          </View>
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
                    data={data.pieData}
                    donut
                    showText
                    textColor={colors.surface}
                    radius={110}
                    innerRadius={65}
                    textSize={16}
                  />
                </View>
                <View style={styles.legendContainer}>
                  {data.pieData.map((item, idx) => (
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
                    data={data.barData}
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
                      <View>
                        <Text style={styles.merchantName}>{m.merchant}</Text>
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

const styles = StyleSheet.create({
  scrollContainer: {
    padding: spacing.md,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  rangeBtnActive: {
    backgroundColor: colors.primarySoft,
  },
  rangeBtnText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  rangeBtnTextActive: {
    color: colors.primary,
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
    ...shadows.sm,
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
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  trendText: {
    ...typography.caption1,
    fontWeight: '600',
    marginLeft: 4,
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
    ...shadows.sm,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  legendValue: {
    ...typography.headline,
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
  },
  merchantRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  merchantRankText: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.primary,
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
  }
});
