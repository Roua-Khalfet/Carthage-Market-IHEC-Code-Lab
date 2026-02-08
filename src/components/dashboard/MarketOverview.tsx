import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { computeMarketOverview, type SentimentAnalysis } from "@/hooks/useSentimentData";

type Props = {
  data: SentimentAnalysis[];
};

export const MarketOverview = ({ data }: Props) => {
  const overview = computeMarketOverview(data);
  const sentimentLabel =
    overview.avgScore > 0.15 ? "Haussier" : overview.avgScore < -0.15 ? "Baissier" : "Neutre";
  const sentimentIcon =
    overview.avgScore > 0.15 ? (
      <TrendingUp className="w-6 h-6" />
    ) : overview.avgScore < -0.15 ? (
      <TrendingDown className="w-6 h-6" />
    ) : (
      <Minus className="w-6 h-6" />
    );

  const cards = [
    {
      label: "Sentiment Global",
      value: sentimentLabel,
      score: overview.avgScore.toFixed(2),
      icon: sentimentIcon,
      color:
        overview.avgScore > 0.15
          ? "text-positive"
          : overview.avgScore < -0.15
          ? "text-negative"
          : "text-neutral-sentiment",
      bg:
        overview.avgScore > 0.15
          ? "bg-positive/10"
          : overview.avgScore < -0.15
          ? "bg-negative/10"
          : "bg-neutral-sentiment/10",
    },
    {
      label: "Articles Positifs",
      value: overview.positive,
      percentage: overview.total ? ((overview.positive / overview.total) * 100).toFixed(0) : 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-positive",
      bg: "bg-positive/10",
    },
    {
      label: "Articles Négatifs",
      value: overview.negative,
      percentage: overview.total ? ((overview.negative / overview.total) * 100).toFixed(0) : 0,
      icon: <TrendingDown className="w-5 h-5" />,
      color: "text-negative",
      bg: "bg-negative/10",
    },
    {
      label: "Articles Analysés",
      value: overview.total,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-muted-foreground",
      bg: "bg-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {card.label}
            </span>
            <div className={`${card.bg} ${card.color} p-2 rounded-md`}>{card.icon}</div>
          </div>
          <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
          {card.score !== undefined && (
            <span className="text-xs text-muted-foreground mt-1 block">
              Score: {card.score}
            </span>
          )}
          {card.percentage !== undefined && (
            <span className="text-xs text-muted-foreground mt-1 block">{card.percentage}% du total</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};
