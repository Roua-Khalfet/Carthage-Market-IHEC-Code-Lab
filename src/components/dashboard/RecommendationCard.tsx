import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Shield } from "lucide-react";

type Props = {
  stockName: string;
  recommendation: "ACHETER" | "VENDRE" | "CONSERVER" | string;
  confidence: number;
  avgScore: number;
  totalArticles: number;
};

const RECO_CONFIG = {
  ACHETER: {
    icon: TrendingUp,
    colorClass: "text-positive",
    bgClass: "bg-positive/10",
    borderClass: "border-l-4 border-l-sentiment-positive",
    label: "ACHETER",
  },
  VENDRE: {
    icon: TrendingDown,
    colorClass: "text-negative",
    bgClass: "bg-negative/10",
    borderClass: "border-l-4 border-l-sentiment-negative",
    label: "VENDRE",
  },
  CONSERVER: {
    icon: Minus,
    colorClass: "text-neutral-sentiment",
    bgClass: "bg-neutral-sentiment/10",
    borderClass: "border-l-4 border-l-sentiment-neutral",
    label: "CONSERVER",
  },
};

export const RecommendationCard = ({
  stockName,
  recommendation,
  confidence,
  avgScore,
  totalArticles,
}: Props) => {
  const config = RECO_CONFIG[recommendation as keyof typeof RECO_CONFIG] || RECO_CONFIG.CONSERVER;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-lg p-6 ${config.borderClass}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`${config.bgClass} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${config.colorClass}`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{stockName}</h3>
          <p className="text-xs text-muted-foreground">Recommandation de l'Agent</p>
        </div>
      </div>

      <div className={`text-3xl font-bold font-mono ${config.colorClass} mb-4`}>
        {config.label}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Score de Confiance
          </span>
          <span className="text-sm font-mono font-semibold text-foreground">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`h-1.5 rounded-full ${
              confidence > 0.7
                ? "bg-positive"
                : confidence > 0.4
                ? "bg-neutral-sentiment"
                : "bg-negative"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-secondary rounded-md p-3 text-center">
            <div className="text-lg font-mono font-bold text-foreground">
              {avgScore > 0 ? "+" : ""}
              {avgScore.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              Score Moyen
            </div>
          </div>
          <div className="bg-secondary rounded-md p-3 text-center">
            <div className="text-lg font-mono font-bold text-foreground">{totalArticles}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              Articles
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
