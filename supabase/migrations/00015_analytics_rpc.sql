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
