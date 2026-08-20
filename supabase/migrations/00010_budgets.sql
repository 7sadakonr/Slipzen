-- 00010_budgets.sql
CREATE TABLE public.budgets (
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

CREATE INDEX idx_budgets_user ON public.budgets(user_id);
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, year, month);
