import { motion } from "framer-motion";
import { useSentimentByStock, computeStockSentiment } from "@/hooks/useSentimentData";
import { SentimentTimeline } from "./SentimentTimeline";
import { RecommendationCard } from "./RecommendationCard";
import { RecentArticles } from "./RecentArticles";
import { Loader2 } from "lucide-react";

type Props = {
  stockName: string;
};

export const StockAnalysisPanel = ({ stockName }: Props) => {
  const { data, isLoading } = useSentimentByStock(stockName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const stockSentiment = data ? computeStockSentiment(data, stockName) : null;

  if (!stockSentiment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-lg p-8 text-center"
      >
        <p className="text-muted-foreground text-sm">
          Aucune analyse disponible pour <span className="font-semibold text-foreground">{stockName}</span>.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Cliquez sur "Analyser les Articles" pour commencer.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={stockName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <RecommendationCard
        stockName={stockName}
        recommendation={stockSentiment.recommendation}
        confidence={Number(stockSentiment.confidence)}
        avgScore={stockSentiment.avgScore}
        totalArticles={stockSentiment.totalArticles}
      />
      <SentimentTimeline data={stockSentiment.timeline} title={`Sentiment - ${stockName}`} />
      <RecentArticles articles={stockSentiment.recentArticles} title="Articles Associés" />
    </motion.div>
  );
};
