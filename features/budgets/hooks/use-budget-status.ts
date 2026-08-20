import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

import { useBudgets } from './use-budgets';
import { startOfMonth, endOfMonth, getDaysInMonth, getDate } from 'date-fns';

export interface BudgetStatus {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  projected: number;
  isExceeded: boolean;
  isOverall: boolean;
}

export function useBudgetStatus(month: number, year: number) {
  const { data: budgets, isLoading: isLoadingBudgets } = useBudgets(month, year);

  return useQuery({
    queryKey: ['budget-status', month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !budgets) return [];

      // Create start and end date for the selected month/year
      // month is 1-indexed (1-12)
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

      // Fetch all transactions in this month to calculate spent amounts
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;
      const validTransactions = transactions || [];

      // Calculate days elapsed for projection
      const now = new Date();
      let daysElapsed = getDaysInMonth(new Date(year, month - 1));
      let isCurrentMonth = false;
      
      if (now.getFullYear() === year && now.getMonth() + 1 === month) {
        daysElapsed = getDate(now) || 1;
        isCurrentMonth = true;
      }

      const totalDays = getDaysInMonth(new Date(year, month - 1));

      return budgets.map(budget => {
        const isOverall = budget.category_id === null;
        
        let spent = 0;
        if (isOverall) {
          spent = validTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        } else {
          spent = validTransactions
            .filter(t => t.category_id === budget.category_id)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        }

        const remaining = budget.limit_amount - spent;
        const percentage = Math.min(Math.round((spent / budget.limit_amount) * 100), 100);
        
        let projected = spent;
        if (isCurrentMonth && daysElapsed > 0) {
          projected = (spent / daysElapsed) * totalDays;
        }

        return {
          id: budget.id,
          categoryId: budget.category_id,
          categoryName: budget.category?.name || 'Overall',
          categoryIcon: budget.category?.icon || null,
          limit: Number(budget.limit_amount),
          spent,
          remaining,
          percentage,
          projected,
          isExceeded: spent > budget.limit_amount,
          isOverall
        } as BudgetStatus;
      });
    },
    enabled: !!budgets,
    staleTime: 60 * 1000,
  });
}
