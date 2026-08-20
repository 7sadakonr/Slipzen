-- 00016_new_rls.sql

-- budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- budget_alert_log
ALTER TABLE public.budget_alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON public.budget_alert_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.budget_alert_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
