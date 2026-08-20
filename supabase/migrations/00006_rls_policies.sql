-- 00006_rls_policies.sql

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- transaction_items
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transaction items" ON public.transaction_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can insert own transaction items" ON public.transaction_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can update own transaction items" ON public.transaction_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can delete own transaction items" ON public.transaction_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);

-- merchant_category_rules
ALTER TABLE public.merchant_category_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own merchant rules" ON public.merchant_category_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own merchant rules" ON public.merchant_category_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own merchant rules" ON public.merchant_category_rules FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own merchant rules" ON public.merchant_category_rules FOR DELETE USING (auth.uid() = user_id);
