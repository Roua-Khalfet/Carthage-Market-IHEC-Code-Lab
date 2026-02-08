import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolioHoldings, useInitialCapital } from "@/hooks/usePortfolio";
import { useMarketData } from "@/hooks/useMarketData";
import { CapitalSetup } from "./CapitalSetup";
import { PortfolioAllocation } from "./PortfolioAllocation";
import { HoldingsManager } from "./HoldingsManager";
import { SimulationRecommendations } from "./SimulationRecommendations";
import type { RiskProfile } from "@/lib/auth-context";

export const SimulationTab = () => {
  const { riskProfile } = useAuth();
  const { data: holdings = [] } = usePortfolioHoldings();
  const { data: capital = 0 } = useInitialCapital();
  const { data: marketData = [] } = useMarketData();

  // Compute portfolio value from live prices
  const priceMap = useMemo(
    () => new Map(marketData.map((s) => [s.symbol, s.price ?? 0])),
    [marketData]
  );

  const stocksValue = useMemo(
    () => holdings.reduce((sum, h) => sum + (priceMap.get(h.symbol) ?? h.purchase_price) * h.quantity, 0),
    [holdings, priceMap]
  );

  const totalPortfolio = capital + stocksValue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Row 1: Capital + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <CapitalSetup />
          {/* Portfolio summary */}
          <div className="glass-card rounded-lg p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Valeur Totale du Portefeuille
            </p>
            <p className="font-mono text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 2 }).format(totalPortfolio)} TND
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>Liquidités: {new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 0 }).format(capital)} TND</span>
              <span>Actions: {new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 0 }).format(stocksValue)} TND</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          {riskProfile ? (
            <PortfolioAllocation
              riskProfile={riskProfile as RiskProfile}
              stocksValue={stocksValue}
              totalPortfolio={totalPortfolio}
            />
          ) : (
            <div className="glass-card rounded-lg p-8 flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Profil de risque non défini</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Holdings */}
      <HoldingsManager />

      {/* Row 3: AI Recommendations */}
      <SimulationRecommendations />
    </motion.div>
  );
};
