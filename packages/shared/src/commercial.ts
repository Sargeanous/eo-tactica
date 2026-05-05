/**
 * Pure commercial-math functions shared by the frontend (live recompute
 * in the editable scenario panels) and the agents service (so an LLM
 * tool can answer "what if scenes doubles" with the same number the UI
 * would show). Never mutate inputs.
 */

// ---------- Imagery commercial (R1.A) ----------

export interface ImageryOperatorInput {
  id: string;
  label: string;
  /** Free-form annotation, e.g. "Emergency <12h · $6,500/sc effective". */
  badge: string;
  scenes: number;
  ratePerScene: number;
}

export interface ImageryScenarioInput {
  operators: ImageryOperatorInput[];
  /** Public list price the customer would have paid line-by-line. */
  listPrice: number;
  /** VAT rate applied on top of `finalExVat`, e.g. 0.05 for 5%. */
  vatPct: number;
}

export interface ImageryScenarioOutput {
  perOperator: Array<{
    id: string;
    scenes: number;
    subtotal: number;
    effectiveRate: number;
  }>;
  totalScenes: number;
  finalExVat: number;
  withVat: number;
  /** listPrice - finalExVat. Floors at 0 if customer overpaid. */
  discount: number;
  discountPct: number;
  /** Headline savings line. Identical to `discount` today; kept separate
   *  so callers can swap the formula without changing the field name. */
  savings: number;
  savingsPct: number;
}

export function computeImageryCommercial(
  input: ImageryScenarioInput,
): ImageryScenarioOutput {
  const perOperator = input.operators.map((op) => {
    const subtotal = op.scenes * op.ratePerScene;
    const effectiveRate = op.scenes > 0 ? subtotal / op.scenes : 0;
    return {
      id: op.id,
      scenes: op.scenes,
      subtotal,
      effectiveRate,
    };
  });
  const totalScenes = perOperator.reduce((acc, r) => acc + r.scenes, 0);
  const finalExVat = perOperator.reduce((acc, r) => acc + r.subtotal, 0);
  const withVat = finalExVat * (1 + input.vatPct);
  const discount = Math.max(0, input.listPrice - finalExVat);
  const discountPct = input.listPrice > 0 ? discount / input.listPrice : 0;
  return {
    perOperator,
    totalScenes,
    finalExVat,
    withVat,
    discount,
    discountPct,
    savings: discount,
    savingsPct: discountPct,
  };
}

// ---------- Algorithm commercial (R1.B) ----------

export interface AlgoRowInput {
  group: string;
  types: number;
  pricePerType: number;
}

export interface AlgoBatchInput {
  label: string;
  rows: AlgoRowInput[];
}

export interface AlgoScenarioInput {
  batches: AlgoBatchInput[];
}

export interface AlgoScenarioOutput {
  perBatch: Array<{
    label: string;
    rows: Array<{ group: string; types: number; price: number }>;
    subtotalTypes: number;
    subtotalPrice: number;
  }>;
  totalTypes: number;
  totalPrice: number;
}

export function computeAlgorithmCommercial(
  input: AlgoScenarioInput,
): AlgoScenarioOutput {
  const perBatch = input.batches.map((b) => {
    const rows = b.rows.map((r) => ({
      group: r.group,
      types: r.types,
      price: r.types * r.pricePerType,
    }));
    const subtotalTypes = rows.reduce((acc, r) => acc + r.types, 0);
    const subtotalPrice = rows.reduce((acc, r) => acc + r.price, 0);
    return { label: b.label, rows, subtotalTypes, subtotalPrice };
  });
  const totalTypes = perBatch.reduce((acc, b) => acc + b.subtotalTypes, 0);
  const totalPrice = perBatch.reduce((acc, b) => acc + b.subtotalPrice, 0);
  return { perBatch, totalTypes, totalPrice };
}

// ---------- Vendor pricing (R3) ----------

export interface VendorScenarioInput {
  /** Number of integrated Eastern vendors. */
  integratedEast: number;
  /** Number of vendors currently in development. */
  inDev: number;
  /** Per-vendor integration fee. Defaults to 0 until the customer signs
   *  the Eastern quote; UI can edit this live. */
  pricePerVendor: number;
  /** Optional Western vendors once customer provides API. */
  westernVendors: number;
}

export interface VendorScenarioOutput {
  totalLive: number;
  totalPipeline: number;
  totalAddressable: number;
  liveFee: number;
  pipelineFee: number;
  combinedFee: number;
}

export function computeVendorCommercial(
  input: VendorScenarioInput,
): VendorScenarioOutput {
  const totalLive = Math.max(0, input.integratedEast);
  const totalPipeline = Math.max(0, input.inDev);
  const totalAddressable =
    totalLive + totalPipeline + Math.max(0, input.westernVendors);
  const rate = Math.max(0, input.pricePerVendor);
  return {
    totalLive,
    totalPipeline,
    totalAddressable,
    liveFee: totalLive * rate,
    pipelineFee: totalPipeline * rate,
    combinedFee: totalAddressable * rate,
  };
}
