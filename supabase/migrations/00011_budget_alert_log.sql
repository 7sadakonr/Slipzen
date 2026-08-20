-- 00011_budget_alert_log.sql
CREATE TABLE public.budget_alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    threshold INTEGER NOT NULL, -- 80, 90, or 100
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_alert_per_threshold
        UNIQUE (budget_id, threshold)
);
