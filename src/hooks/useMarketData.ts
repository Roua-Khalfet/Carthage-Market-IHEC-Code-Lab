import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type StockMarketRow = {
  id: string;
  symbol: string;
  name: string | null;
  price: number | null;
  change_percent: number | null;
  volume: string | null;
  rel_volume: number | null;
  market_cap: string | null;
  pe_ratio: number | null;
  eps_dil_ttm: number | null;
  eps_dil_growth_ttm_yoy: number | null;
  div_yield_ttm: number | null;
  sector: string | null;
  analyst_rating: string | null;
  rsi_14: number | null;
  tech_rating: string | null;
  ma_rating: string | null;
  os_rating: string | null;
  momentum_10: number | null;
  ao: number | null;
  cci_20: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  macd_level: number | null;
  macd_signal: number | null;
  scraped_at: string;
  tab_source: string | null;
};

export const useMarketData = () => {
  return useQuery({
    queryKey: ["stock-market-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_market_data")
        .select("*")
        .order("symbol", { ascending: true });

      if (error) throw error;
      return (data || []) as StockMarketRow[];
    },
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
  });
};

export const useTriggerScrape = () => {
  const [isScraping, setIsScraping] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const triggerScrape = useCallback(async () => {
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scrape-tradingview",
        { body: {} }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data?.cached) {
        toast({
          title: "Données à jour",
          description: "Les données sont encore fraîches (< 15 min).",
        });
      } else {
        toast({
          title: "Scraping terminé",
          description: `${data?.inserted || 0} actions mises à jour.`,
        });
      }

      // ALWAYS invalidate to ensure UI has latest data from DB
      queryClient.invalidateQueries({ queryKey: ["stock-market-data"] });

      return data;
    } catch (err: any) {
      console.error("Scrape error:", err);
      toast({
        title: "Erreur de scraping",
        description: err?.message || "Impossible de scraper TradingView",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  }, [queryClient, toast]);

  // Auto-scrape on mount only if no data exists
  useEffect(() => {
    const checkAndScrape = async () => {
      const { data: existing } = await supabase
        .from("stock_market_data")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (!existing) {
        // No data at all, trigger initial scrape
        triggerScrape();
      }
    };

    checkAndScrape();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isScraping, triggerScrape };
};
