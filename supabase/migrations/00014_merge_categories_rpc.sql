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
