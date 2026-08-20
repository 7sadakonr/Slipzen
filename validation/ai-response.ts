import { z } from 'zod';

export const aiResponseSchema = z.object({
  merchant: z.string().min(1).default('Unknown Merchant'),
  amount: z.number().positive().default(0),
  date: z.string().nullable().default(null),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().default(1),
    total_price: z.number(),
  })).default([]),
  payment_method: z.string().nullable().default(null),
  suggested_category: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.5),
});
