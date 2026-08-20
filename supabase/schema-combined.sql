-- 00001_profiles.sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_path TEXT,
    currency TEXT NOT NULL DEFAULT 'THB',
    locale TEXT NOT NULL DEFAULT 'th-TH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- 00002_categories.sql
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    icon TEXT,
    created_by TEXT NOT NULL DEFAULT 'user'
        CHECK (created_by IN ('system', 'user', 'ai')),
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_categories_user_normalized
        UNIQUE (user_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);


-- 00003_transactions.sql
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    merchant TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'THB',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    payment_method TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT,
    receipt_path TEXT,
    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'receipt_ai')),
    ai_confidence NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);


-- 00004_transaction_items.sql
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_items_txn ON public.transaction_items(transaction_id);


-- 00005_merchant_category_rules.sql
CREATE TABLE IF NOT EXISTS public.merchant_category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    merchant_normalized TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'user'
        CHECK (source IN ('user', 'ai')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_merchant_rules_user_merchant
        UNIQUE (user_id, merchant_normalized)
);

CREATE INDEX IF NOT EXISTS idx_merchant_rules_user ON public.merchant_category_rules(user_id);


-- 00006_rls_policies.sql

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- transaction_items
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transaction items" ON public.transaction_items;
CREATE POLICY "Users can view own transaction items" ON public.transaction_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert own transaction items" ON public.transaction_items;
CREATE POLICY "Users can insert own transaction items" ON public.transaction_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can update own transaction items" ON public.transaction_items;
CREATE POLICY "Users can update own transaction items" ON public.transaction_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can delete own transaction items" ON public.transaction_items;
CREATE POLICY "Users can delete own transaction items" ON public.transaction_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid())
);

-- merchant_category_rules
ALTER TABLE public.merchant_category_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own merchant rules" ON public.merchant_category_rules;
CREATE POLICY "Users can view own merchant rules" ON public.merchant_category_rules FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own merchant rules" ON public.merchant_category_rules;
CREATE POLICY "Users can insert own merchant rules" ON public.merchant_category_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own merchant rules" ON public.merchant_category_rules;
CREATE POLICY "Users can update own merchant rules" ON public.merchant_category_rules FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own merchant rules" ON public.merchant_category_rules;
CREATE POLICY "Users can delete own merchant rules" ON public.merchant_category_rules FOR DELETE USING (auth.uid() = user_id);


-- 00007_storage.sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
CREATE POLICY "Users can upload own receipts" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
CREATE POLICY "Users can view own receipts" ON storage.objects FOR SELECT USING (
    bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
CREATE POLICY "Users can delete own receipts" ON storage.objects FOR DELETE USING (
    bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);


-- 00008_seed_categories_function.sql
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, normalized_name, icon, created_by, ai_generated)
    VALUES
        (NEW.id, 'Food & Drink',    'food & drink',    '🍔', 'system', false),
        (NEW.id, 'Transport',       'transport',       '🚗', 'system', false),
        (NEW.id, 'Shopping',        'shopping',        '🛍️', 'system', false),
        (NEW.id, 'Bills',           'bills',           '🧾', 'system', false),
        (NEW.id, 'Entertainment',   'entertainment',   '🎬', 'system', false),
        (NEW.id, 'Health',          'health',          '💊', 'system', false),
        (NEW.id, 'Education',       'education',       '📚', 'system', false),
        (NEW.id, 'Travel',          'travel',          '✈️', 'system', false),
        (NEW.id, 'Subscription',    'subscription',    '🔄', 'system', false),
        (NEW.id, 'Other',           'other',           '📦', 'system', false);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_seed_categories ON public.profiles;
CREATE TRIGGER on_profile_created_seed_categories
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_default_categories();


-- 00009_save_receipt_rpc.sql
CREATE OR REPLACE FUNCTION public.save_receipt_transaction(
    p_merchant TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_category_id UUID,
    p_category_name TEXT DEFAULT NULL,
    p_category_normalized TEXT DEFAULT NULL,
    p_is_new_category BOOLEAN DEFAULT false,
    p_payment_method TEXT DEFAULT NULL,
    p_transaction_date TIMESTAMPTZ DEFAULT now(),
    p_note TEXT DEFAULT NULL,
    p_receipt_path TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'receipt_ai',
    p_ai_confidence NUMERIC DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_merchant_normalized TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_category_id UUID := p_category_id;
    v_transaction_id UUID;
BEGIN
    IF p_is_new_category AND p_category_name IS NOT NULL THEN
        INSERT INTO public.categories (user_id, name, normalized_name, icon, created_by, ai_generated)
        VALUES (v_user_id, p_category_name, COALESCE(p_category_normalized, lower(trim(p_category_name))), '🏷️', 'ai', true)
        ON CONFLICT (user_id, normalized_name) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_category_id;
    END IF;

    INSERT INTO public.transactions (
        user_id, merchant, amount, currency, category_id,
        payment_method, transaction_date, note, receipt_path,
        source, ai_confidence
    ) VALUES (
        v_user_id, p_merchant, p_amount, p_currency, v_category_id,
        p_payment_method, p_transaction_date, p_note, p_receipt_path,
        p_source, p_ai_confidence
    )
    RETURNING id INTO v_transaction_id;

    IF jsonb_array_length(p_items) > 0 THEN
        INSERT INTO public.transaction_items (transaction_id, name, quantity, unit_price, total_price)
        SELECT
            v_transaction_id,
            item->>'name',
            (item->>'quantity')::numeric,
            (item->>'unit_price')::numeric,
            (item->>'total_price')::numeric
        FROM jsonb_array_elements(p_items) AS item;
    END IF;

    IF p_merchant_normalized IS NOT NULL AND v_category_id IS NOT NULL THEN
        INSERT INTO public.merchant_category_rules (user_id, merchant_normalized, category_id, source)
        VALUES (v_user_id, p_merchant_normalized, v_category_id, p_source)
        ON CONFLICT (user_id, merchant_normalized)
        DO UPDATE SET
            category_id = EXCLUDED.category_id,
            source = EXCLUDED.source,
            updated_at = now();
    END IF;

    RETURN v_transaction_id;
END;
$$;


-- 00010_budgets.sql
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    limit_amount NUMERIC(12,2) NOT NULL CHECK (limit_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- NULL category_id = overall monthly budget
    CONSTRAINT uq_budgets_user_month_category
        UNIQUE (user_id, month, year, category_id)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);


-- 00011_budget_alert_log.sql
CREATE TABLE IF NOT EXISTS public.budget_alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    threshold INTEGER NOT NULL, -- 80, 90, or 100
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_alert_per_threshold
        UNIQUE (budget_id, threshold)
);


-- 00012_insights.sql
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    content JSONB NOT NULL,      -- Array of insight strings
    summary_data JSONB NOT NULL, -- The aggregated data sent to AI
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_insights_user_period
        UNIQUE (user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_insights_user ON public.insights(user_id);


-- 00013_transaction_source_gallery.sql
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS transactions_source_check;

ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_source_check
    CHECK (source IN ('manual', 'receipt_ai', 'receipt_gallery'));


-- 00014_merge_categories_rpc.sql
CREATE OR REPLACE FUNCTION public.merge_categories(
    p_source_category_id UUID,
    p_target_category_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Verify ownership of both categories
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = p_source_category_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Source category not found or not owned';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = p_target_category_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Target category not found or not owned';
    END IF;

    -- Move transactions
    UPDATE public.transactions
    SET category_id = p_target_category_id, updated_at = now()
    WHERE category_id = p_source_category_id AND user_id = v_user_id;

    -- Move merchant rules
    UPDATE public.merchant_category_rules
    SET category_id = p_target_category_id, updated_at = now()
    WHERE category_id = p_source_category_id AND user_id = v_user_id;

    -- Move budgets (delete conflicts)
    DELETE FROM public.budgets
    WHERE category_id = p_source_category_id AND user_id = v_user_id
    AND EXISTS (
        SELECT 1 FROM public.budgets b2
        WHERE b2.category_id = p_target_category_id
        AND b2.user_id = v_user_id
        AND b2.month = budgets.month AND b2.year = budgets.year
    );

    UPDATE public.budgets
    SET category_id = p_target_category_id, updated_at = now()
    WHERE category_id = p_source_category_id AND user_id = v_user_id;

    -- Delete source category
    DELETE FROM public.categories WHERE id = p_source_category_id AND user_id = v_user_id;
END;
$$;


-- 00015_analytics_rpc.sql
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_spending', COALESCE(SUM(amount), 0),
        'transaction_count', COUNT(*),
        'daily_average', CASE 
            WHEN EXTRACT(DAY FROM p_end_date - p_start_date) > 0
            THEN COALESCE(SUM(amount), 0) / EXTRACT(DAY FROM p_end_date - p_start_date)
            ELSE COALESCE(SUM(amount), 0)
        END,
        'largest_expense', COALESCE(MAX(amount), 0)
    ) INTO v_result
    FROM public.transactions
    WHERE user_id = v_user_id
    AND transaction_date >= p_start_date
    AND transaction_date <= p_end_date;

    RETURN v_result;
END;
$$;


-- 00016_new_rls.sql

-- budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- budget_alert_log
ALTER TABLE public.budget_alert_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.budget_alert_log;
CREATE POLICY "Users can view own alerts" ON public.budget_alert_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.budget_alert_log;
CREATE POLICY "Users can insert own alerts" ON public.budget_alert_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own insights" ON public.insights;
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own insights" ON public.insights;
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 00017_fix_save_receipt_rpc.sql

DROP FUNCTION IF EXISTS public.save_receipt_transaction(text, numeric, text, uuid, text, text, boolean, text, timestamptz, text, text, text, numeric, jsonb, text);
DROP FUNCTION IF EXISTS public.save_receipt_transaction(text, numeric, text, uuid, text, text, boolean, text, timestamptz, text, text, text, numeric, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.save_receipt_transaction(
    p_merchant TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_category_id UUID,
    p_category_name TEXT DEFAULT NULL,
    p_category_normalized TEXT DEFAULT NULL,
    p_is_new_category BOOLEAN DEFAULT false,
    p_payment_method TEXT DEFAULT NULL,
    p_transaction_date TIMESTAMPTZ DEFAULT now(),
    p_note TEXT DEFAULT NULL,
    p_receipt_path TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'receipt_ai',
    p_ai_confidence NUMERIC DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_merchant_normalized TEXT DEFAULT NULL,
    p_rule_source TEXT DEFAULT 'ai'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_category_id UUID := p_category_id;
    v_transaction_id UUID;
BEGIN
    IF p_is_new_category AND p_category_name IS NOT NULL THEN
        INSERT INTO public.categories (user_id, name, normalized_name, icon, created_by, ai_generated)
        VALUES (v_user_id, p_category_name, COALESCE(p_category_normalized, lower(trim(p_category_name))), '🏷️', 'ai', true)
        ON CONFLICT (user_id, normalized_name) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_category_id;
    END IF;

    INSERT INTO public.transactions (
        user_id, merchant, amount, currency, category_id,
        payment_method, transaction_date, note, receipt_path,
        source, ai_confidence
    ) VALUES (
        v_user_id, p_merchant, p_amount, p_currency, v_category_id,
        p_payment_method, p_transaction_date, p_note, p_receipt_path,
        p_source, p_ai_confidence
    )
    RETURNING id INTO v_transaction_id;

    IF jsonb_array_length(p_items) > 0 THEN
        INSERT INTO public.transaction_items (transaction_id, name, quantity, unit_price, total_price)
        SELECT
            v_transaction_id,
            item->>'name',
            (item->>'quantity')::numeric,
            (item->>'unit_price')::numeric,
            (item->>'total_price')::numeric
        FROM jsonb_array_elements(p_items) AS item;
    END IF;

    IF p_merchant_normalized IS NOT NULL AND v_category_id IS NOT NULL THEN
        INSERT INTO public.merchant_category_rules (user_id, merchant_normalized, category_id, source)
        VALUES (v_user_id, p_merchant_normalized, v_category_id, COALESCE(p_rule_source, 'ai'))
        ON CONFLICT (user_id, merchant_normalized)
        DO UPDATE SET
            category_id = EXCLUDED.category_id,
            source = EXCLUDED.source,
            updated_at = now();
    END IF;

    RETURN v_transaction_id;
END;
$$;



-- ==========================================
-- AUTO-SYNC MISSING PROFILES
-- ==========================================
-- This ensures that if the public schema is reset but auth users remain, 
-- their profiles and default categories are automatically restored.
INSERT INTO public.profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data ->> 'display_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
