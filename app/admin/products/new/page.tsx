// =============================================================================
//  app/admin/products/new/page.tsx  —  Admin: add a pre-owned product
//  RBAC is enforced server-side in middleware.ts (matcher: /admin/*, /api/admin/*)
//  BEFORE this page renders — hiding the UI is never the security boundary.
// =============================================================================
'use client';

import { useState } from 'react';

const field =
  'w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm ' +
  'outline-none focus:border-accent focus:ring-1 focus:ring-accent';
const label = 'mb-1 block text-xs font-medium text-muted';

type Status = { kind: 'idle' | 'saving' | 'ok' | 'error'; msg?: string };

export default function NewProductForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const saving = status.kind === 'saving';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus({ kind: 'saving' });

    try {
      // Send FormData directly — DO NOT JSON.stringify (that drops File objects
      // and turns checkboxes into "on"). Let the browser set the multipart
      // Content-Type + boundary; the server reads it with req.formData().
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: new FormData(formEl),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Save failed (HTTP ${res.status})`);
      }
      setStatus({ kind: 'ok', msg: 'Product saved.' });
      formEl.reset();
    } catch (err) {
      // On flaky 2G the fetch can reject — handle it so the button never
      // gets stuck on "Saving…".
      setStatus({ kind: 'error', msg: err instanceof Error ? err.message : 'Network error' });
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Add Pre-Owned Product</h1>

      {status.kind === 'ok' && (
        <p className="mb-4 rounded-xl border border-hairline bg-soft px-4 py-3 text-sm text-success">{status.msg}</p>
      )}
      {status.kind === 'error' && (
        <p className="mb-4 rounded-xl border border-hairline bg-soft px-4 py-3 text-sm text-danger">{status.msg}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Category</label>
            <select name="categoryId" className={field} required defaultValue="1">
              <option value="1">Smartphone</option>
              <option value="2">Charger</option>
              <option value="3">Earbuds / Air Buds</option>
              <option value="4">Cable</option>
              <option value="5">Case / Cover</option>
              <option value="6">Power Bank</option>
            </select>
          </div>
          <div>
            <label className={label}>Brand</label>
            <select name="brandId" className={field} required defaultValue="">
              <option value="" disabled>Select…</option>
              <option value="1">Apple</option>
              <option value="2">Samsung</option>
              <option value="3">Xiaomi</option>
              <option value="4">Anker</option>
              <option value="5">Baseus</option>
              <option value="6">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Model / Product Name</label>
          <input name="model" className={field} placeholder="iPhone 13 Pro  ·  or  ·  USB-C Cable 1m" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Price (৳)</label>
            <input name="price" type="number" min="0" className={field} required />
          </div>
          <div>
            <label className={label}>Original Price (৳)</label>
            <input name="mrp" type="number" min="0" className={field} />
          </div>
        </div>

        {/* Condition fields — leave grade as "New" and battery blank for accessories */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>Condition</label>
            <select name="grade" className={field} defaultValue="">
              <option value="">New / Not graded</option>
              <option value="A_PLUS">A+ (Like New)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div>
            <label className={label}>Battery Health (% · phones)</label>
            <input name="batteryHealth" type="number" min="0" max="100" className={field} />
          </div>
          <div>
            <label className={label}>Warranty (months)</label>
            <input name="warrantyMonths" type="number" min="0" className={field} defaultValue={0} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Stock Status</label>
            <select name="stock" className={field} defaultValue="IN_STOCK">
              <option value="IN_STOCK">In stock</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="hasBox" className="accent-[var(--accent)]" /> Box
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="hasCharger" className="accent-[var(--accent)]" /> Charger
            </label>
            <span className="pb-0.5 text-[11px] text-muted">(phones)</span>
          </div>
        </div>

        <div>
          <label className={label}>Images</label>
          <input name="images" type="file" accept="image/*" multiple className={field} />
          <p className="mt-1 text-xs text-muted">Uploaded to CDN; a blur placeholder is generated server-side.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}
