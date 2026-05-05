export interface Scenario {
  /** Cascade input: shifts every dependent task right by N units. */
  delayUnits: number;
  /** Multiplier on the baseline cost line. */
  costMultiplier: number;
  /** Multiplier on the baseline benefit line. */
  benefitMultiplier: number;
  /** Discount rate for NPV. Optional so old persisted scenarios still parse. */
  discountRatePct?: number;
  /** Annual escalation applied to both cost and benefit lines. */
  annualInflationPct?: number;
}

export const DEFAULT_SCENARIO: Scenario = {
  delayUnits: 0,
  costMultiplier: 1.0,
  benefitMultiplier: 1.0,
  discountRatePct: 0.10,
  annualInflationPct: 0.02,
};

export function isScenarioActive(s: Scenario): boolean {
  return (
    s.delayUnits !== 0 ||
    s.costMultiplier !== 1.0 ||
    s.benefitMultiplier !== 1.0 ||
    (s.discountRatePct !== undefined && s.discountRatePct !== 0.10) ||
    (s.annualInflationPct !== undefined && s.annualInflationPct !== 0.02)
  );
}

export interface CashflowRow {
  period: number;
  cost: number;
  benefit: number;
}

export interface AdjustedRow extends CashflowRow {
  net: number;
  cumulative: number;
}

/**
 * Pure function: takes a baseline cashflow series and returns the
 * scenario-adjusted series. Caller never mutates `base`.
 *
 * Cascade rule: rows in the operating phase (any period whose cost or
 * benefit is non-zero) are shifted right by `delayUnits` and the carrying
 * gap is filled with zero-flow rows.
 */
export function applyScenario(
  base: CashflowRow[],
  scenario: Scenario,
): AdjustedRow[] {
  const delay = Math.max(0, Math.floor(scenario.delayUnits));
  const inflation = scenario.annualInflationPct ?? 0;

  const shifted: CashflowRow[] = [];
  for (let i = 0; i < base.length; i++) {
    if (i < delay) {
      const head = base[i]!;
      shifted.push({ period: head.period, cost: 0, benefit: 0 });
    }
    const src = base[i]!;
    shifted.push({
      period: src.period + delay,
      cost: src.cost,
      benefit: src.benefit,
    });
  }

  let cumulative = 0;
  return shifted.map((row, idx) => {
    const escalation = inflation === 0 ? 1 : Math.pow(1 + inflation, idx);
    const cost = row.cost * scenario.costMultiplier * escalation;
    const benefit = row.benefit * scenario.benefitMultiplier * escalation;
    const net = benefit - cost;
    cumulative += net;
    return { period: row.period, cost, benefit, net, cumulative };
  });
}

export interface ScenarioKpis {
  paybackPeriod: number | null;
  irrPct: number | null;
  npvAed: number;
}

/** Pure function: derived KPIs from an adjusted series. */
export function computeKpis(
  adjusted: AdjustedRow[],
  discountRatePct?: number,
): ScenarioKpis {
  const r = discountRatePct ?? 0;
  let npv = 0;
  for (let i = 0; i < adjusted.length; i++) {
    npv += adjusted[i]!.net / Math.pow(1 + r, i);
  }

  let payback: number | null = null;
  for (let i = 0; i < adjusted.length; i++) {
    if (adjusted[i]!.cumulative >= 0) {
      payback = adjusted[i]!.period;
      break;
    }
  }

  const irr = computeIrr(adjusted.map((a) => a.net));

  return { paybackPeriod: payback, irrPct: irr, npvAed: npv };
}

function computeIrr(flows: number[]): number | null {
  if (flows.length < 2) return null;
  let lo = -0.99;
  let hi = 10;
  const npv = (rate: number) =>
    flows.reduce((acc, f, i) => acc + f / Math.pow(1 + rate, i), 0);
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1e-6) return mid;
    if (npv(lo) * v < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
