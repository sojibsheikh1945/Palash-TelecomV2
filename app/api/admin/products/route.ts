import { NextRequest, NextResponse } from 'next/server';
import { newProductSchema } from '@/lib/validation';

// Accepts multipart/form-data (fields + image files) from the admin form.
// Protected by middleware.ts (matcher covers /api/admin/*).
export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Validate scalar fields with Zod (checkboxes arrive only when checked).
  const fields = Object.fromEntries(
    Array.from(form.entries()).filter(([, v]) => typeof v === 'string'),
  );
  fields.hasBox = String(form.has('hasBox'));
  fields.hasCharger = String(form.has('hasCharger'));

  const parsed = newProductSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const images = form.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  // TODO (prod): validate MIME + size, upload to object storage/CDN, generate
  // LQIP blur, INSERT product + product_images inside one transaction.

  const data = parsed.data;
  const product = {
    ...data,
    pricePaisa: data.price * 100,
    mrpPaisa: data.mrp != null ? data.mrp * 100 : null,
    imageCount: images.length,
  };

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
