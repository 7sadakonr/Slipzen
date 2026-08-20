-- 00013_transaction_source_gallery.sql
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS transactions_source_check;

ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_source_check
    CHECK (source IN ('manual', 'receipt_ai', 'receipt_gallery'));
