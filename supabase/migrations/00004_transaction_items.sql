-- 00004_transaction_items.sql
CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transaction_items_txn ON public.transaction_items(transaction_id);
