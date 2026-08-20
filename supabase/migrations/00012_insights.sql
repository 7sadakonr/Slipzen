-- 00012_insights.sql
CREATE TABLE public.insights (
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

CREATE INDEX idx_insights_user ON public.insights(user_id);
