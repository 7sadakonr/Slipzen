import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, transactions(count)')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
