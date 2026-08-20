import { supabase } from '../../../lib/supabase';
import { scheduleBudgetAlert } from '../../../utils/notifications';

export async function checkAndTriggerBudgetAlerts(userId: string, month: number, year: number) {
  try {
    // 1. Fetch budgets for user
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*, category:categories(name)')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);

    if (!budgets || budgets.length === 0) return;

    // 2. Fetch all transactions to calculate spent
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (!transactions) return;

    // 3. Evaluate each budget
    for (const budget of budgets) {
      const isOverall = budget.category_id === null;
      let spent = 0;
      
      if (isOverall) {
        spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      } else {
        spent = transactions
          .filter(t => t.category_id === budget.category_id)
          .reduce((sum, t) => sum + Number(t.amount), 0);
      }

      const percentage = (spent / Number(budget.limit_amount)) * 100;
      let threshold = 0;

      if (percentage >= 100) {
        threshold = 100;
      } else if (percentage >= 90) {
        threshold = 90;
      } else if (percentage >= 80) {
        threshold = 80;
      }

      // If a threshold is crossed, log it and alert
      if (threshold > 0) {
        // Try inserting into budget_alert_log
        // If it violates the UNIQUE(budget_id, threshold) constraint, it fails safely
        const { error } = await supabase
          .from('budget_alert_log')
          .insert({
            user_id: userId,
            budget_id: budget.id,
            threshold
          });

        // Only fire if insertion succeeded (meaning this threshold hasn't been fired yet)
        if (!error) {
          const categoryName = isOverall ? 'Overall' : (budget.category?.name || 'Category');
          let title = `Budget Alert: ${categoryName}`;
          let body = `You have used ${threshold}% of your ${categoryName} budget.`;
          
          if (threshold === 100) {
            title = `Budget Exceeded: ${categoryName}`;
            body = `You have exceeded your ${categoryName} budget limit!`;
          }
          
          await scheduleBudgetAlert(title, body);
        }
      }
    }
  } catch (err) {
    console.error('Budget alert check failed:', err);
  }
}
