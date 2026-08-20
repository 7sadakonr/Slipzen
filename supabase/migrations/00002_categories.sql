-- 00002_categories.sql
CREATE TABLE public.categories (
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

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
