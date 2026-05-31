// =============================================================================
//  app/api/payment/ipn/route.ts  —  server-to-server payment webhook.
//  Order status is decided HERE, never by the browser redirect (which is
//  unreliable on 2G). Idempotent + amount-checked + atomic. (ARCHITECTURE §2)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateWithGateway } from '@/lib/sslcommerz';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = Object.fromEntries(await req.formData()) as Record<string, string>;

  // 1. Authenticate against the gateway (don't trust the POST body).
  const verified = await validateWithGateway(body.val_id);
  if (!verified.ok) return NextResponse.json({ ok: false }, { status: 400 });

  await db.transaction(async (tx) => {
    const txn = await tx.getTxnForUpdate(body.tran_id);     // SELECT ... FOR UPDATE
    if (!txn || txn.status === 'SUCCESS') return;            // 2. idempotent
    if (verified.amountPaisa !== txn.amount_paisa) return;   // 3. amount check
    await tx.markTxnSuccess(txn.id, body.val_id, body);      // 4. atomic commit
    await tx.markOrderPaid(txn.order_id);
    await tx.markItemsSold(txn.order_id);
  });

  // Always 200 so the gateway stops retrying.
  return NextResponse.json({ ok: true });
}
