-- 00005_merchant_category_rules.sql
CREATE TABLE public.merchant_category_rules (
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

CREATE INDEX idx_merchant_rules_user ON public.merchant_category_rules(user_id);
