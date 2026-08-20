import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { startOfMonth, endOfMonth } from 'date-fns';

export function useDashboardStats(year?: number, month?: number) {
  const now = new Date();
  const filterYear = year ?? now.getFullYear();
  const filterMonth = month ?? now.getMonth();

  return useQuery({
    queryKey: ['dashboard', filterYear, filterMonth],
    queryFn: async () => {
      const targetDate = new Date(filterYear, filterMonth, 1);
      const start = startOfMonth(targetDate).toISOString();
      const end = endOfMonth(targetDate).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          merchant,
          transaction_date,
          categories (name, icon)
        `)
        .gte('transaction_date', start)
        .lte('transaction_date', end)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      let total = 0;
      const categoryTotals: Record<string, { total: number, name: string, icon: string }> = {};

      data.forEach(tx => {
        const amt = parseFloat(tx.amount);
        total += amt;
        
        const catId = (tx.categories as any)?.name || 'Uncategorized';
        const catName = (tx.categories as any)?.name || 'Uncategorized';
        const catIcon = (tx.categories as any)?.icon || '📦';
        
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = { total: 0, name: catName, icon: catIcon };
        }
        categoryTotals[catId].total += amt;
      });

      const topCategories = Object.values(categoryTotals)
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);

      // Calculate 7-day trend (last 7 days of the month, or up to today if current month)
      const isCurrentMonth = filterYear === now.getFullYear() && filterMonth === now.getMonth();
      const trendEndDate = isCurrentMonth ? now : endOfMonth(targetDate);
      
      const dailyTotals = Array(7).fill(0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(trendEndDate);
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toISOString().split('T')[0];
        
        // Sum transactions for this day
        const dayTotal = data
          .filter(tx => tx.transaction_date.startsWith(dayStr))
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          
        dailyTotals[i] = {
          date: d,
          total: dayTotal
        };
      }

      return {
        total,
        transactionCount: data.length,
        averageExpense: data.length > 0 ? total / data.length : 0,
        topCategory: topCategories[0] || null,
        topCategories,
        recentTransactions: data.slice(0, 5), // Last 5 transactions
        trend: dailyTotals
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
