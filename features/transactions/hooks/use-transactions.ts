import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { startOfMonth, endOfMonth } from 'date-fns';

const PAGE_SIZE = 20;

export interface TransactionFilters {
  search?: string;
  categoryId?: string | null;
  year?: number;
  month?: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (name, icon)
        `)
        .order('transaction_date', { ascending: false })
        .range(from, to);

      if (filters.search) {
        query = query.ilike('merchant', `%${filters.search}%`);
      }
      
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      // If month and year are provided, filter by that month
      if (filters.year !== undefined && filters.month !== undefined) {
        const targetDate = new Date(filters.year, filters.month, 1);
        const start = startOfMonth(targetDate).toISOString();
        const end = endOfMonth(targetDate).toISOString();
        query = query.gte('transaction_date', start).lte('transaction_date', end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
