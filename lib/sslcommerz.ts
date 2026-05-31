// =============================================================================
//  lib/sslcommerz.ts  —  gateway validation (ARCHITECTURE.md §2 step 1).
//  NEVER trust the raw IPN body; re-validate against the gateway's API.
// =============================================================================
export interface GatewayValidation {
  ok: boolean;
  amountPaisa?: number;
}

/**
 * Demo implementation. Production: call the SSLCommerz Validation API with
 * `val_id` + store passcode over HTTPS and verify status === 'VALID'/'VALIDATED',
 * then return the gateway-reported amount (converted to paisa).
 */
export async function validateWithGateway(valId: string | undefined): Promise<GatewayValidation> {
  if (!valId) return { ok: false };
  const live = process.env.SSLCZ_IS_LIVE === 'true';
  if (!live) {
    // Sandbox: accept and echo the demo order's amount.
    return { ok: true, amountPaisa: 7_200_000 };
  }
  // const url = `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php`
  //           + `?val_id=${valId}&store_id=${process.env.SSLCZ_STORE_ID}`
  //           + `&store_passwd=${process.env.SSLCZ_STORE_PASSWD}&format=json`;
  // const r = await fetch(url); const j = await r.json();
  // return { ok: ['VALID','VALIDATED'].includes(j.status), amountPaisa: Math.round(Number(j.amount) * 100) };
  return { ok: false };
}
