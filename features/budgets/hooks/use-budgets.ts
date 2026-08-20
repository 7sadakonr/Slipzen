import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  month: number;
  year: number;
  limit_amount: number;
  category?: {
    name: string;
    icon: string | null;
  } | null;
}

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(name, icon)
        `)
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .order('category_id', { ascending: true, nullsFirst: true });

      if (error) throw error;
      return data as Budget[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
