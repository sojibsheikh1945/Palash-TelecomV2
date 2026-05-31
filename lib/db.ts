// =============================================================================
//  lib/db.ts  —  data access used by write paths (payments, admin).
//
//  For the demo this is an in-memory transactional store so the IPN endpoint
//  works end-to-end with no Postgres. To go live: install `pg`, point at
//  DATABASE_URL, and replace the method bodies with parameterised SQL inside a
//  real `BEGIN; ... COMMIT;` (see schema.sql for the tables). The interface
//  below intentionally matches the IPN skeleton in ARCHITECTURE.md §2.
// =============================================================================
import 'server-only';

type TxnStatus = 'INITIATED' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

interface Txn {
  id: string;
  tran_id: string;
  order_id: string;
  amount_paisa: number;
  status: TxnStatus;
  val_id?: string;
}

// Seed one pending transaction so the IPN route is demonstrable out of the box.
const txns = new Map<string, Txn>([
  ['PT-TXN-DEMO-0001', {
    id: 'demo-txn-1', tran_id: 'PT-TXN-DEMO-0001', order_id: 'demo-order-1',
    amount_paisa: 7_200_000, status: 'INITIATED',
  }],
]);
const orders = new Map<string, { id: string; status: string }>([
  ['demo-order-1', { id: 'demo-order-1', status: 'PENDING_PAYMENT' }],
]);

export interface Tx {
  getTxnForUpdate(tranId: string): Promise<Txn | undefined>; // SELECT ... FOR UPDATE
  markTxnSuccess(id: string, valId: string, raw: unknown): Promise<void>;
  markOrderPaid(orderId: string): Promise<void>;
  markItemsSold(orderId: string): Promise<void>;
}

export const db = {
  /**
   * Runs `fn` inside a logical transaction. In-memory here; with `pg`:
   *   const client = await pool.connect();
   *   try { await client.query('BEGIN'); await fn(tx); await client.query('COMMIT'); }
   *   catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
   */
  async transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    const tx: Tx = {
      async getTxnForUpdate(tranId) { return txns.get(tranId); },
      async markTxnSuccess(id, valId, _raw) {
        for (const t of txns.values()) if (t.id === id) { t.status = 'SUCCESS'; t.val_id = valId; }
      },
      async markOrderPaid(orderId) { const o = orders.get(orderId); if (o) o.status = 'PAID'; },
      async markItemsSold(_orderId) { /* UPDATE products SET stock='SOLD' WHERE id IN (...) */ },
    };
    return fn(tx);
  },
};
