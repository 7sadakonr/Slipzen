CREATE OR REPLACE FUNCTION get_available_months()
RETURNS TABLE (
    year DOUBLE PRECISION,
    month DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT DISTINCT
        EXTRACT(YEAR FROM transaction_date) as year,
        EXTRACT(MONTH FROM transaction_date) as month
    FROM transactions
    WHERE user_id = auth.uid()
    ORDER BY year DESC, month DESC;
$$;
