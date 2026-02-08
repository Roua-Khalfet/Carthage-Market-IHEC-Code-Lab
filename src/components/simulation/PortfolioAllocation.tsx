import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { RiskProfile } from "@/lib/auth-context";

const ALLOCATION_TARGETS: Record<RiskProfile, { label: string; actions: number; obligations: number; liquidite: number }> = {
  conservateur: { label: "Conservateur", actions: 20, obligations: 40, liquidite: 40 },
  modere: { label: "Modéré", actions: 40, obligations: 30, liquidite: 30 },
  agressif: { label: "Agressif", actions: 70, obligations: 20, liquidite: 10 },
};

const COLORS = [
  "hsl(160, 70%, 45%)", // actions — primary green
  "hsl(210, 60%, 55%)", // obligations — blue
  "hsl(40, 90%, 55%)",  // liquidité — accent yellow
];

type Props = {
  riskProfile: RiskProfile;
  stocksValue: number;
  totalPortfolio: number;
};

export const PortfolioAllocation = ({ riskProfile, stocksValue, totalPortfolio }: Props) => {
  const targets = ALLOCATION_TARGETS[riskProfile];

  const { currentData, targetData, deviation } = useMemo(() => {
    const actionsPercent = totalPortfolio > 0 ? (stocksValue / totalPortfolio) * 100 : 0;
    const remainingValue = totalPortfolio - stocksValue;
    // Split remaining between obligations and liquidité proportionally to target
    const targetObligRatio = targets.obligations / (targets.obligations + targets.liquidite);
    const obligationsValue = remainingValue * targetObligRatio;
    const liquiditeValue = remainingValue * (1 - targetObligRatio);
    const obligPercent = totalPortfolio > 0 ? (obligationsValue / totalPortfolio) * 100 : 0;
    const liqPercent = totalPortfolio > 0 ? (liquiditeValue / totalPortfolio) * 100 : 0;

    return {
      currentData: [
        { name: "Actions", value: Math.round(actionsPercent) },
        { name: "Obligations", value: Math.round(obligPercent) },
        { name: "Liquidité", value: Math.round(liqPercent) },
      ],
      targetData: [
        { name: "Actions", value: targets.actions },
        { name: "Obligations", value: targets.obligations },
        { name: "Liquidité", value: targets.liquidite },
      ],
      deviation: Math.abs(actionsPercent - targets.actions),
    };
  }, [stocksValue, totalPortfolio, targets]);

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Allocation du Portefeuille</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {targets.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Target */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">Cible</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={targetData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                {targetData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Actual */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">Actuel</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={currentData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                {currentData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend + deviation */}
      <div className="flex items-center justify-center gap-4 text-[11px]">
        {COLORS.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-muted-foreground">{targetData[i].name}</span>
          </div>
        ))}
      </div>

      {deviation > 10 && (
        <p className="text-[11px] text-center text-accent">
          ⚠ Votre allocation en actions dévie de {deviation.toFixed(0)}% de la cible
        </p>
      )}
    </div>
  );
};
