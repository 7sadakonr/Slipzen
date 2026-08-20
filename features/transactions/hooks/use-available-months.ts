import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { startOfMonth } from 'date-fns';

export function useAvailableMonths() {
  return useQuery({
    queryKey: ['available-months'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [startOfMonth(new Date())];

      // Fetch all dates (fast and small payload since we only ask for one column)
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .eq('user_id', user.id);
        
      if (error) throw error;

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      
      const uniqueMonths = new Set<number>();
      
      (data || []).forEach(tx => {
        const d = new Date(tx.transaction_date);
        const monthStart = startOfMonth(d).getTime();
        uniqueMonths.add(monthStart);
      });
      
      uniqueMonths.add(currentMonthStart.getTime());
      
      const months = Array.from(uniqueMonths).map(time => new Date(time));
      
      // Sort descending (newest first)
      months.sort((a, b) => b.getTime() - a.getTime());
      
      return months;
    },
    staleTime: 5 * 60 * 1000,
  });
}
