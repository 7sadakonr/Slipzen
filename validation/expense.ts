import { z } from 'zod';

export const manualExpenseSchema = z.object({
  merchant: z.string().min(1, 'Merchant or Title is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  categoryId: z.string().uuid('Please select a category').nullable(),
  transactionDate: z.date(),
  note: z.string().optional(),
});

export type ManualExpenseInput = z.infer<typeof manualExpenseSchema>;
