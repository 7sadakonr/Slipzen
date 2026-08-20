import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name, icon),
          transaction_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Also get signed URL for receipt image if exists
      let imageUrl = null;
      if (data.receipt_path) {
        const { data: urlData } = await supabase.storage
          .from('receipts')
          .createSignedUrl(data.receipt_path, 3600); // 1 hour
        imageUrl = urlData?.signedUrl;
      }

      return { ...data, imageUrl };
    },
    enabled: !!id,
  });
}
