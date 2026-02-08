import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolioHoldings, useInitialCapital } from "@/hooks/usePortfolio";
import { useMarketData } from "@/hooks/useMarketData";
import { useSentimentData } from "@/hooks/useSentimentData";
import { generateRecommendations, type StockRecommendation } from "@/lib/recommendation-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { RiskProfile } from "@/lib/auth-context";

const actionColors: Record<string, string> = {
  ACHETER: "bg-positive/15 text-positive border-positive/30",
  VENDRE: "bg-negative/15 text-negative border-negative/30",
  CONSERVER: "bg-accent/15 text-accent border-accent/30",
};

const actionIcons: Record<string, typeof TrendingUp> = {
  ACHETER: TrendingUp,
  VENDRE: TrendingDown,
  CONSERVER: Minus,
};

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const ScoreBar = ({ points, maxPoints, label }: { points: number; maxPoints: number; label: string }) => {
  const pct = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
      <Progress value={pct} className="h-1.5 flex-1" />
      <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
        {points}/{maxPoints}
      </span>
    </div>
  );
};

const RecommendationCard = ({ rec }: { rec: StockRecommendation }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = actionIcons[rec.action] || Minus;

  const scoreColor =
    rec.totalScore >= 65 ? "text-positive" : rec.totalScore >= 40 ? "text-accent" : "text-negative";

  return (
    <div className="rounded-lg bg-secondary/30 border border-border/40 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
      >
        <Icon
          className={`w-4 h-4 shrink-0 ${
            rec.action === "ACHETER" ? "text-positive" : rec.action === "VENDRE" ? "text-negative" : "text-accent"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-primary">{rec.symbol}</span>
            <span className="text-[11px] text-muted-foreground truncate">{rec.name}</span>
            <Badge variant="outline" className={`text-[10px] ${actionColors[rec.action]}`}>
              {rec.action}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {rec.suggestedAmount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {rec.suggestedQty}× {fmt(rec.price)} = <span className="font-medium text-foreground">{fmt(rec.suggestedAmount)} TND</span>
            </span>
          )}
          <span className={`font-mono text-lg font-bold ${scoreColor}`}>{rec.totalScore}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2">
          {rec.factors.map((f, i) => (
            <div key={i}>
              <ScoreBar points={f.points} maxPoints={f.maxPoints} label={f.label} />
              <p className="text-[10px] text-muted-foreground ml-[104px] mt-0.5 leading-relaxed">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SimulationRecommendations = () => {
  const { riskProfile } = useAuth();
  const { data: holdings = [] } = usePortfolioHoldings();
  const { data: capital = 0 } = useInitialCapital();
  const { data: marketData = [] } = useMarketData();
  const { data: sentimentData = [] } = useSentimentData();

  const [generated, setGenerated] = useState(false);

  const recommendations = useMemo(() => {
    if (!generated || !riskProfile || !marketData.length) return [];
    return generateRecommendations(
      marketData,
      sentimentData,
      holdings,
      riskProfile as RiskProfile,
      capital
    );
  }, [generated, marketData, sentimentData, holdings, riskProfile, capital]);

  const totalSuggested = recommendations.reduce((s, r) => s + r.suggestedAmount, 0);

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Recommandations</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setGenerated(true)}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Analyser
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Score sur 100 : Sentiment (25) + Technique (25) + Fondamentaux (15) + Profil {riskProfile} (15) + Diversification (10) + Prédiction 5j (10).
        Budget max : {fmt(capital)} TND.
      </p>

      {!generated && (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground text-center">
            Cliquez sur "Analyser" pour calculer vos recommandations
          </p>
        </div>
      )}

      {generated && recommendations.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground text-center">
            Aucune recommandation disponible. Vérifiez vos données de marché.
          </p>
        </div>
      )}

      {recommendations.length > 0 && (
        <>
          {totalSuggested > 0 && (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-primary/5 border border-primary/20 text-xs">
              <span className="text-muted-foreground">Investissement total suggéré</span>
              <span className="font-mono font-bold text-primary">{fmt(totalSuggested)} TND</span>
              <span className="text-muted-foreground">/ {fmt(capital)} TND disponible</span>
            </div>
          )}

          <div className="space-y-2">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.symbol} rec={rec} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
