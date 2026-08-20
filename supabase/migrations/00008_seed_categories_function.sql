-- 00008_seed_categories_function.sql
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, normalized_name, icon, created_by, ai_generated)
    VALUES
        (NEW.id, 'Food & Drink',    'food & drink',    '🍔', 'system', false),
        (NEW.id, 'Transport',       'transport',       '🚗', 'system', false),
        (NEW.id, 'Shopping',        'shopping',        '🛍️', 'system', false),
        (NEW.id, 'Bills',           'bills',           '🧾', 'system', false),
        (NEW.id, 'Entertainment',   'entertainment',   '🎬', 'system', false),
        (NEW.id, 'Health',          'health',          '💊', 'system', false),
        (NEW.id, 'Education',       'education',       '📚', 'system', false),
        (NEW.id, 'Travel',          'travel',          '✈️', 'system', false),
        (NEW.id, 'Subscription',    'subscription',    '🔄', 'system', false),
        (NEW.id, 'Other',           'other',           '📦', 'system', false);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_seed_categories
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_default_categories();
