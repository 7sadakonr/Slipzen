const fs = require('fs');

let f17 = fs.readFileSync('supabase/migrations/00017_fix_save_receipt_rpc.sql', 'utf8');
f17 = f17.replace(/'\?\?\?'/g, "'🏷️'");
fs.writeFileSync('supabase/migrations/00017_fix_save_receipt_rpc.sql', f17, 'utf8');

let f9 = fs.readFileSync('supabase/migrations/00009_save_receipt_rpc.sql', 'utf8');
f9 = f9.replace(/'\?\?\?'/g, "'🏷️'");
fs.writeFileSync('supabase/migrations/00009_save_receipt_rpc.sql', f9, 'utf8');

let f8 = fs.readFileSync('supabase/migrations/00008_seed_categories_function.sql', 'utf8');
f8 = f8.replace(/'\?\?'/g, "''"); // We need to be careful
// Actually let's just rewrite f8 completely
const f8_new = `-- 00008_seed_categories_function.sql
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
`;
fs.writeFileSync('supabase/migrations/00008_seed_categories_function.sql', f8_new, 'utf8');

console.log('Done fixing emojis');
