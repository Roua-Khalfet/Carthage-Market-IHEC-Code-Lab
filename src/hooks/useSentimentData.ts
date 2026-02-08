import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SentimentAnalysis } from "@/types";

/**
 * Hook pour récupérer toutes les analyses de sentiment
 * 
 * @returns Query object avec les données de sentiment triées par date
 * 
 * @example
 * ```tsx
 * const { data: sentiments, isLoading, error } = useSentimentData();
 * ```
 */
export const useSentimentData = () => {
  return useQuery({
    queryKey: ["sentiment-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sentiment_analyses")
        .select("*")
        .order("analyzed_at", { ascending: true }); // Ordre chronologique pour timeline

      if (error) {
        console.error("Error fetching sentiment data:", error);
        throw error;
      }
      
      return (data || []) as SentimentAnalysis[];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook pour récupérer les analyses de sentiment d'une valeur spécifique
 * 
 * @param stockSymbol - Symbole de la valeur (ex: "BNA", "STB")
 * @returns Query object avec les données filtrées par symbole
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useSentimentByStock("BNA");
 * ```
 */
export const useSentimentByStock = (stockSymbol: string) => {
  return useQuery({
    queryKey: ["sentiment-by-stock", stockSymbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sentiment_analyses")
        .select("*")
        .eq("stock_symbol", stockSymbol)
        .order("date", { ascending: true });

      if (error) {
        console.error(`Error fetching sentiment for ${stockSymbol}:`, error);
        throw error;
      }
      
      return (data || []) as SentimentAnalysis[];
    },
    enabled: !!stockSymbol && stockSymbol.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

};

export const useAnalyzeSentiment = () => {
  const analyze = async (limit = 20) => {
    const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
      body: { limit },
    });
    if (error) throw error;
    return data;
  };
  return { analyze };
};

export const computeMarketOverview = (data: SentimentAnalysis[]) => {
  if (!data.length) return { positive: 0, negative: 0, neutral: 0, avgScore: 0, total: 0 };

  const positive = data.filter((d) => d.sentiment === "positive").length;
  const negative = data.filter((d) => d.sentiment === "negative").length;
  const neutral = data.filter((d) => d.sentiment === "neutral").length;
  const avgScore = data.reduce((sum, d) => sum + Number(d.sentiment_score), 0) / data.length;

  return { positive, negative, neutral, avgScore, total: data.length };
};

export const computeStockSentiment = (data: SentimentAnalysis[], stockName: string) => {
  const stockData = data.filter((d) => d.affected_stocks?.includes(stockName));
  if (!stockData.length) return null;

  const avgScore =
    stockData.reduce((sum, d) => sum + Number(d.sentiment_score), 0) / stockData.length;

  const latestRecommendation = stockData[0]?.recommendation || "CONSERVER";
  const latestConfidence = stockData[0]?.confidence_score || 0;

  // Compute daily aggregated scores
  const dailyScores = new Map<string, { total: number; count: number }>();
  for (const d of stockData) {
    const date = d.published_date || d.analyzed_at.slice(0, 10);
    const existing = dailyScores.get(date) || { total: 0, count: 0 };
    existing.total += Number(d.sentiment_score);
    existing.count += 1;
    dailyScores.set(date, existing);
  }

  const timeline = Array.from(dailyScores.entries())
    .map(([date, { total, count }]) => ({
      date,
      score: Number((total / count).toFixed(2)),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    stockName,
    avgScore,
    totalArticles: stockData.length,
    recommendation: latestRecommendation,
    confidence: latestConfidence,
    timeline,
    recentArticles: stockData.slice(0, 5),
  };
};
