// =============================================================================
//  lib/validation.ts  —  Zod schemas. Every write path validates server-side.
// =============================================================================
import { z } from 'zod';

// NB: z.coerce.boolean() is a trap — Boolean("false") === true. Map explicitly.
const checkbox = z.preprocess(
  (v) => v === true || v === 'true' || v === 'on' || v === '1' || v === 'yes',
  z.boolean(),
);

// Coerce because multipart/form-data values arrive as strings.
export const newProductSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  brandId: z.coerce.number().int().positive(),
  model: z.string().trim().min(2).max(120),
  price: z.coerce.number().int().min(0),                  // taka; server multiplies to paisa
  mrp: z.coerce.number().int().min(0).optional().or(z.literal('').transform(() => undefined)),
  grade: z.enum(['A_PLUS', 'A', 'B', 'C']).optional().or(z.literal('').transform(() => undefined)),
  batteryHealth: z.coerce.number().int().min(0).max(100).optional().or(z.literal('').transform(() => undefined)),
  warrantyMonths: z.coerce.number().int().min(0).max(36).default(0),
  stock: z.enum(['IN_STOCK', 'RESERVED', 'SOLD']).default('IN_STOCK'),
  hasBox: checkbox,
  hasCharger: checkbox,
});
export type NewProductInput = z.infer<typeof newProductSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});
