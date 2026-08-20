import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface InsightData {
  id: string;
  month: number;
  year: number;
  content: string[];
  summary_data: any;
  generated_at: string;
}

export function useInsights() {
  const queryClient = useQueryClient();

  // Get current month/year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fetchInsights = async (): Promise<InsightData | null> => {
    // 1. Check cache in DB
    const { data: cached, error: cacheError } = await supabase
      .from('insights')
      .select('*')
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .maybeSingle();

    if (cacheError) throw cacheError;

    // 2. Check age (if < 6 hours, return it)
    if (cached) {
      const generatedAt = new Date(cached.generated_at).getTime();
      const sixHoursMs = 6 * 60 * 60 * 1000;
      if (now.getTime() - generatedAt < sixHoursMs) {
        return cached as InsightData;
      }
    }

    // 3. Otherwise generate new insight via Edge Function
    const { data, error } = await supabase.functions.invoke('generate-insight', {
      body: { month: currentMonth, year: currentYear }
    });

    if (error) {
      // Fallback to cached even if old, if Edge function fails
      if (cached) return cached as InsightData;
      throw error;
    }

    const newInsight = {
      month: currentMonth,
      year: currentYear,
      content: data.insights,
      summary_data: data.summary_data,
    };

    // 4. Update DB (Upsert)
    const { data: savedInsight, error: saveError } = await supabase
      .from('insights')
      .upsert({
        ...newInsight,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        generated_at: new Date().toISOString()
      }, { onConflict: 'user_id,month,year' })
      .select()
      .single();

    if (saveError) throw saveError;
    return savedInsight as InsightData;
  };

  const query = useQuery({
    queryKey: ['insights', currentMonth, currentYear],
    queryFn: fetchInsights,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours client-side cache
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Force regeneration via Edge Function
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: { month: currentMonth, year: currentYear }
      });
      if (error) throw error;
      
      const newInsight = {
        month: currentMonth,
        year: currentYear,
        content: data.insights,
        summary_data: data.summary_data,
      };

      const { data: savedInsight, error: saveError } = await supabase
        .from('insights')
        .upsert({
          ...newInsight,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          generated_at: new Date().toISOString()
        }, { onConflict: 'user_id,month,year' })
        .select()
        .single();

      if (saveError) throw saveError;
      return savedInsight as InsightData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['insights', currentMonth, currentYear], data);
    }
  });

  return {
    ...query,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending
  };
}
