import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export type DateRange = '7D' | '30D' | 'This Month' | 'Last Month';

export function useAnalytics(range: DateRange = '30D') {
  return useQuery({
    queryKey: ['analytics', range],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;
      
      let prevStartDate: Date;
      let prevEndDate: Date;

      if (range === '7D') {
        startDate = subDays(now, 7);
        prevStartDate = subDays(startDate, 7);
        prevEndDate = startDate;
      } else if (range === '30D') {
        startDate = subDays(now, 30);
        prevStartDate = subDays(startDate, 30);
        prevEndDate = startDate;
      } else if (range === 'This Month') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        prevStartDate = startOfMonth(subMonths(now, 1));
        prevEndDate = endOfMonth(subMonths(now, 1));
      } else { // Last Month
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        prevStartDate = startOfMonth(subMonths(now, 2));
        prevEndDate = endOfMonth(subMonths(now, 2));
      }

      const isoStart = startDate.toISOString();
      const isoEnd = endDate.toISOString();

      // 1. Fetch Aggregates via RPC
      const { data: currentSummary, error: rpcError } = await supabase.rpc('get_analytics_summary', {
        p_start_date: isoStart,
        p_end_date: isoEnd
      });
      if (rpcError) throw rpcError;

      const { data: prevSummary, error: prevRpcError } = await supabase.rpc('get_analytics_summary', {
        p_start_date: prevStartDate.toISOString(),
        p_end_date: prevEndDate.toISOString()
      });
      if (prevRpcError) throw prevRpcError;

      // Calculate Change
      const currentTotal = currentSummary?.total_spending || 0;
      const prevTotal = prevSummary?.total_spending || 0;
      let percentChange = 0;
      if (prevTotal === 0) {
        percentChange = currentTotal > 0 ? 100 : 0; // Or handle as 'N/A' in UI
      } else {
        percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
      }

      // 2. Fetch Transactions for Charts
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          transaction_date,
          merchant,
          categories (name, icon)
        `)
        .gte('transaction_date', isoStart)
        .lte('transaction_date', isoEnd)
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      const categoryMap: Record<string, number> = {};
      const dateMap: Record<string, number> = {};
      const merchantMap: Record<string, { total: number, count: number }> = {};
      
      const colors = ['#777AFF', '#FF9F0A', '#32ADE6', '#34C759', '#FF3B30', '#AF52DE', '#FF9500', '#5856D6'];

      (data || []).forEach(tx => {
        const amt = parseFloat(tx.amount);

        // Category
        const catName = (tx.categories as any)?.name || 'Uncategorized';
        categoryMap[catName] = (categoryMap[catName] || 0) + amt;

        // Date
        const dateStr = tx.transaction_date.split('T')[0];
        dateMap[dateStr] = (dateMap[dateStr] || 0) + amt;

        // Merchant
        const merchant = tx.merchant || 'Unknown';
        if (!merchantMap[merchant]) merchantMap[merchant] = { total: 0, count: 0 };
        merchantMap[merchant].total += amt;
        merchantMap[merchant].count += 1;
      });

      const pieData = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([key, val], index) => ({
          value: val,
          color: colors[index % colors.length],
          text: (data.find(d => (d.categories as any)?.name === key)?.categories as any)?.icon || '📦',
          label: key,
        }));

      const barData = Object.entries(dateMap)
        .map(([key, val]) => ({
          value: val,
          label: key.substring(8, 10),
          frontColor: '#777AFF', // Design token color
        }));

      const topMerchants = Object.entries(merchantMap)
        .map(([merchant, stats]) => ({ merchant, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        summary: currentSummary,
        prevTotal,
        percentChange,
        pieData,
        barData,
        topMerchants
      };
    }
  });
}
