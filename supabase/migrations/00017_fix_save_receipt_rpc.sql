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
