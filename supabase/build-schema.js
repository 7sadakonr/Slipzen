const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('supabase/migrations')
  .filter(f => f.endsWith('.sql'))
  .sort();

let combined = '';
for (const f of files) {
  combined += fs.readFileSync(path.join('supabase/migrations', f), 'utf8') + '\n\n';
}

combined = combined.replace(/CREATE TABLE public\.([a-zA-Z0-9_]+)/g, 'CREATE TABLE IF NOT EXISTS public.$1');
combined = combined.replace(/CREATE INDEX ([a-zA-Z0-9_]+)/g, 'CREATE INDEX IF NOT EXISTS $1');
combined = combined.replace(/CREATE UNIQUE INDEX ([a-zA-Z0-9_]+)/g, 'CREATE UNIQUE INDEX IF NOT EXISTS $1');

// Fix triggers
combined = combined.replace(/CREATE TRIGGER (\w+)\s+AFTER INSERT ON ([a-zA-Z0-9_\.]+)/g, 'DROP TRIGGER IF EXISTS $1 ON $2;\nCREATE TRIGGER $1\n    AFTER INSERT ON $2');

// Fix policies
combined = combined.replace(/CREATE POLICY "([^"]+)" ON ([a-zA-Z0-9_\.]+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');

// Append profile sync snippet
combined += `
-- ==========================================
-- AUTO-SYNC MISSING PROFILES
-- ==========================================
-- This ensures that if the public schema is reset but auth users remain, 
-- their profiles and default categories are automatically restored.
INSERT INTO public.profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data ->> 'display_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
`;

fs.writeFileSync('supabase/schema-combined.sql', combined, 'utf8');
console.log('Rebuilt schema-combined.sql with IF NOT EXISTS, DROP TRIGGER, DROP POLICY, and AUTO-SYNC');
