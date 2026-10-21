import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { aiResponseSchema } from '../../../validation/ai-response';

/** Turns raw edge-function/Gemini errors into something a person can act on. */
function friendlyScanError(raw: string): string {
  if (/AI_BUSY|UNAVAILABLE|high demand|\b503\b|\b429\b/i.test(raw)) {
    return 'The AI service is busy right now. Wait a moment and tap Try Again, or add the expense manually.';
  }
  if (/Failed to send a request|network|fetch failed/i.test(raw)) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (/invalid data format|JSON/i.test(raw)) {
    return "We couldn't read that receipt. Try a clearer photo, or add the expense manually.";
  }
  return 'Something went wrong while reading the receipt. Please try again.';
}

export function useScanReceipt() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('scan-receipt', {
        body: { storagePath }
      });

      if (response.error) {
        throw new Error(friendlyScanError(response.error.message));
      }

      const data = response.data;
      
      if (data && data.success === false) {
        throw new Error(friendlyScanError(String(data.error || '')));
      }

      // Validate with Zod
      const validated = aiResponseSchema.safeParse(data);
      if (!validated.success) {
        console.warn('AI returned invalid data format:', validated.error.message);
        throw new Error(friendlyScanError('invalid data format'));
      }

      return validated.data;
    }
  });
}
