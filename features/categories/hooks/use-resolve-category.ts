import { supabase } from '../../../lib/supabase';
import { normalizeMerchant } from '../../../utils/normalize';

export interface ResolvedCategory {
  categoryId: string | null;
  categoryName: string;
  isNew: boolean;
  source: 'merchant_rule' | 'ai_match' | 'ai_new' | 'fallback';
  label: string;
}

export async function resolveCategory(
  merchant: string,
  suggestedCategory: string | null,
  confidence: number,
  userCategories: Array<{ id: string; name: string; normalized_name: string }>
): Promise<ResolvedCategory> {
  
  const normalizedMerchant = normalizeMerchant(merchant);

  // 1. Check merchant_category_rules
  const { data: rule, error } = await supabase
    .from('merchant_category_rules')
    .select('category_id, categories(name)')
    .eq('merchant_normalized', normalizedMerchant)
    .maybeSingle();

  if (rule?.category_id && !error) {
    return {
      categoryId: rule.category_id,
      categoryName: (rule.categories as any)?.name || 'Unknown',
      isNew: false,
      source: 'merchant_rule',
      label: '🏷️ Matched by your rule',
    };
  }

  // 2. Match AI suggestion against existing categories
  if (suggestedCategory) {
    const normalizedSuggestion = suggestedCategory.toLowerCase().trim();
    const match = userCategories.find(
      c => c.normalized_name === normalizedSuggestion
    );
    if (match) {
      return {
        categoryId: match.id,
        categoryName: match.name,
        isNew: false,
        source: 'ai_match',
        label: '✨ AI categorized',
      };
    }
  }

  // 3. AI suggests new category (confidence >= 0.80)
  if (suggestedCategory && confidence >= 0.80) {
    return {
      categoryId: null,
      categoryName: suggestedCategory,
      isNew: true,
      source: 'ai_new',
      label: '🆕 New category suggested by AI',
    };
  }

  // 4. Fallback to "Other"
  const other = userCategories.find(c => c.normalized_name === 'other');
  return {
    categoryId: other?.id || null,
    categoryName: 'Other',
    isNew: false,
    source: 'fallback',
    label: '📦 Low confidence — please select',
  };
}
