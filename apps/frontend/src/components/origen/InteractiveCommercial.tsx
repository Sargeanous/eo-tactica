import { useMemo, useState } from "react";
import {
  computeAlgorithmCommercial,
  computeImageryCommercial,
  computeVendorCommercial,
  type AlgoScenarioInput,
  type ImageryScenarioInput,
  type VendorScenarioInput,
} from "@eo-tactica/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageryBlock = {
  type: "imagery_commercial";
  heading: string;
  baseline: ImageryScenarioInput;
  note?: string;
};
type AlgorithmBlock = {
  type: "algorithm_commercial";
  heading: string;
  baseline: AlgoScenarioInput;
  bullets?: string[];
};
type VendorBlock = {
  type: "vendor_commercial";
  heading: string;
  baseline: VendorScenarioInput;
  bullets?: string[];
};
export type InteractiveBlock = ImageryBlock | AlgorithmBlock | VendorBlock;

const fmt$ = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const fmtPct = (n: number) =>
  `${(n * 100).toFixed(n >= 0.1 ? 1 : 2)}%`;

function NumCell({
  value,
  onChange,
  step = 1,
  min = 0,
  prefix,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  prefix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
      <Input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="h-8 w-28 text-right"
      />
    </div>
  );
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// ---------- Imagery (R1.A) ----------

function ImageryView({ block }: { block: ImageryBlock }) {
  const [state, setState] = useState<ImageryScenarioInput>(() =>
    clone(block.baseline),
  );
  const out = useMemo(() => computeImageryCommercial(state), [state]);
  const dirty = JSON.stringify(state) !== JSON.stringify(block.baseline);

  return (
    <Card className="border-brand-300/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{block.heading}</CardTitle>
          {block.note && (
            <p className="mt-1 text-xs text-muted-foreground">{block.note}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty}
          onClick={() => setState(clone(block.baseline))}
        >
          <RotateCcw size={12} className="me-1" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Source</th>
                <th className="text-left px-3 py-2">Note</th>
                <th className="text-right px-3 py-2">Scenes</th>
                <th className="text-right px-3 py-2">Rate / scene</th>
                <th className="text-right px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {state.operators.map((op, i) => (
                <tr key={op.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{op.label}</td>
                  <td className="px-3 py-2 text-muted-foreground">{op.badge}</td>
                  <td className="px-3 py-2 text-right">
                    <NumCell
                      value={op.scenes}
                      onChange={(n) =>
                        setState((s) => {
                          const next = clone(s);
                          next.operators[i]!.scenes = n;
                          return next;
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <NumCell
                      value={op.ratePerScene}
                      step={100}
                      onChange={(n) =>
                        setState((s) => {
                          const next = clone(s);
                          next.operators[i]!.ratePerScene = n;
                          return next;
                        })
                      }
                      prefix="$"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {fmt$.format(out.perOperator[i]?.subtotal ?? 0)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border bg-brand-50/60">
                <td className="px-3 py-2 font-semibold">Total</td>
                <td />
                <td className="px-3 py-2 text-right font-semibold">
                  {out.totalScenes}
                </td>
                <td />
                <td className="px-3 py-2 text-right font-semibold text-brand-700">
                  {fmt$.format(out.finalExVat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">List Price</span>
              <NumCell
                value={state.listPrice}
                step={1000}
                prefix="$"
                onChange={(n) =>
                  setState((s) => ({ ...s, listPrice: n }))
                }
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT</span>
              <NumCell
                value={state.vatPct * 100}
                step={0.5}
                prefix="%"
                onChange={(n) =>
                  setState((s) => ({ ...s, vatPct: n / 100 }))
                }
              />
            </div>
          </div>
          <div className="rounded-md bg-brand-50 border border-brand-300/30 p-3 space-y-1">
            <Row label="Final (ex-VAT)" value={fmt$.format(out.finalExVat)} bold />
            <Row label="One-shot Discount" value={`−${fmt$.format(out.discount)}`} />
            <Row label="Discount %" value={fmtPct(out.discountPct)} />
            <Row label={`Incl. ${fmtPct(state.vatPct)} VAT`} value={fmt$.format(out.withVat)} bold />
            <Row
              label="Volume savings"
              value={`${fmt$.format(out.savings)} (${fmtPct(out.savingsPct)})`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Algorithm (R1.B) ----------

function AlgorithmView({ block }: { block: AlgorithmBlock }) {
  const [state, setState] = useState<AlgoScenarioInput>(() =>
    clone(block.baseline),
  );
  const out = useMemo(() => computeAlgorithmCommercial(state), [state]);
  const dirty = JSON.stringify(state) !== JSON.stringify(block.baseline);

  return (
    <Card className="border-brand-300/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{block.heading}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty}
          onClick={() => setState(clone(block.baseline))}
        >
          <RotateCcw size={12} className="me-1" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.batches.map((batch, bi) => (
          <div
            key={batch.label}
            className="rounded-md border border-border overflow-hidden"
          >
            <div className="px-3 py-2 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              {batch.label}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Group</th>
                  <th className="text-right px-3 py-2">Types</th>
                  <th className="text-right px-3 py-2">Price / type</th>
                  <th className="text-right px-3 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {batch.rows.map((row, ri) => (
                  <tr key={ri} className="border-t border-border">
                    <td className="px-3 py-2">{row.group}</td>
                    <td className="px-3 py-2 text-right">
                      <NumCell
                        value={row.types}
                        onChange={(n) =>
                          setState((s) => {
                            const next = clone(s);
                            next.batches[bi]!.rows[ri]!.types = n;
                            return next;
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <NumCell
                        value={row.pricePerType}
                        step={500}
                        prefix="$"
                        onChange={(n) =>
                          setState((s) => {
                            const next = clone(s);
                            next.batches[bi]!.rows[ri]!.pricePerType = n;
                            return next;
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmt$.format(out.perBatch[bi]?.rows[ri]?.price ?? 0)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-brand-50/40">
                  <td className="px-3 py-2 font-semibold">Subtotal</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {out.perBatch[bi]?.subtotalTypes ?? 0}
                  </td>
                  <td />
                  <td className="px-3 py-2 text-right font-semibold text-brand-700">
                    {fmt$.format(out.perBatch[bi]?.subtotalPrice ?? 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        <div className="rounded-md bg-brand-50 border border-brand-300/30 p-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Programme Total</div>
          <div className="flex items-center gap-4 text-sm">
            <span>{out.totalTypes} types</span>
            <span className="font-semibold text-brand-700">
              {fmt$.format(out.totalPrice)}
            </span>
          </div>
        </div>
        {block.bullets && block.bullets.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">
            {block.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Vendor (R3) ----------

function VendorView({ block }: { block: VendorBlock }) {
  const [state, setState] = useState<VendorScenarioInput>(() =>
    clone(block.baseline),
  );
  const out = useMemo(() => computeVendorCommercial(state), [state]);
  const dirty = JSON.stringify(state) !== JSON.stringify(block.baseline);

  return (
    <Card className="border-brand-300/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{block.heading}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty}
          onClick={() => setState(clone(block.baseline))}
        >
          <RotateCcw size={12} className="me-1" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Row
            label="Integrated (East)"
            input={
              <NumCell
                value={state.integratedEast}
                onChange={(n) =>
                  setState((s) => ({ ...s, integratedEast: n }))
                }
              />
            }
          />
          <Row
            label="In Dev (East)"
            input={
              <NumCell
                value={state.inDev}
                onChange={(n) => setState((s) => ({ ...s, inDev: n }))}
              />
            }
          />
          <Row
            label="Western vendors (forecast)"
            input={
              <NumCell
                value={state.westernVendors}
                onChange={(n) =>
                  setState((s) => ({ ...s, westernVendors: n }))
                }
              />
            }
          />
          <Row
            label="Per-vendor integration fee"
            input={
              <NumCell
                value={state.pricePerVendor}
                step={1000}
                prefix="$"
                onChange={(n) =>
                  setState((s) => ({ ...s, pricePerVendor: n }))
                }
              />
            }
          />
        </div>
        <div className="rounded-md bg-brand-50 border border-brand-300/30 p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <Row
            label="Live fee (already integrated)"
            value={fmt$.format(out.liveFee)}
          />
          <Row
            label="Pipeline fee (in dev)"
            value={fmt$.format(out.pipelineFee)}
          />
          <Row
            label="Combined addressable"
            value={`${out.totalAddressable} vendors · ${fmt$.format(out.combinedFee)}`}
            bold
          />
        </div>
        {block.bullets && block.bullets.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">
            {block.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  input,
  bold,
}: {
  label: string;
  value?: string;
  input?: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {input ?? (
        <span className={cn("text-right", bold && "font-semibold text-brand-700")}>
          {value}
        </span>
      )}
    </div>
  );
}

// ---------- dispatcher ----------

export function InteractiveSection({ block }: { block: InteractiveBlock }) {
  if (block.type === "imagery_commercial") return <ImageryView block={block} />;
  if (block.type === "algorithm_commercial")
    return <AlgorithmView block={block} />;
  if (block.type === "vendor_commercial") return <VendorView block={block} />;
  return null;
}
