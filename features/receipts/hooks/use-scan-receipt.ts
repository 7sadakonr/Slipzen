import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { aiResponseSchema } from '../../../validation/ai-response';

export function useScanReceipt() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('scan-receipt', {
        body: { storagePath }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      
      if (data && data.success === false) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      // Validate with Zod
      const validated = aiResponseSchema.safeParse(data);
      if (!validated.success) {
        throw new Error('AI returned invalid data format: ' + validated.error.message);
      }

      return validated.data;
    }
  });
}
