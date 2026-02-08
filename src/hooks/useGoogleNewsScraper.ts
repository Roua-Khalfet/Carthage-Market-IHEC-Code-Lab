import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SECTOR_LABELS } from "@/lib/stocks";

/**
 * Clés des secteurs BVMT pour le scraping (excluant les indices)
 */
const SECTOR_KEYS = [
  "banks",
  "leasing",
  "insurance",
  "automotive",
  "food_and_beverage",
  "retail_and_distribution",
  "building_materials",
  "chemicals_and_materials",
  "technology_and_telecom",
  "industrial_and_manufacturing",
  "pharmaceuticals_and_healthcare",
  "holding_and_investment",
  "transport_and_aviation",
] as const;

/**
 * État de progression du scraping
 */
export type ScrapeProgress = {
  currentSector: string;
  currentSectorIndex: number;
  totalSectors: number;
  articlesScraped: number;
  articlesInserted: number;
  errors: string[];
  phase: "scraping" | "analyzing" | "done" | "idle";
};

/**
 * Hook pour gérer le scraping Google News et l'analyse de sentiment
 * 
 * Processus:
 * 1. Scrape les actualités pour chaque secteur via Edge Function
 * 2. Stocke les articles dans Supabase
 * 3. Lance l'analyse de sentiment avec Azure OpenAI
 * 4. Met à jour le cache React Query
 * 
 * @returns Objet avec état et fonction de lancement
 * 
 * @example
 * ```tsx
 * const { startScraping, isRunning, progress } = useGoogleNewsScraper();
 * 
 * <Button onClick={startScraping} disabled={isRunning}>
 *   {isRunning ? "En cours..." : "Scraper les news"}
 * </Button>
 * ```
 */
export const useGoogleNewsScraper = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ScrapeProgress>({
    currentSector: "",
    currentSectorIndex: 0,
    totalSectors: SECTOR_KEYS.length,
    articlesScraped: 0,
    articlesInserted: 0,
    errors: [],
    phase: "idle",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const runScrapeAndAnalyze = useCallback(async () => {
    setIsRunning(true);
    let totalScraped = 0;
    let totalInserted = 0;
    const allErrors: string[] = [];

    setProgress({
      currentSector: "",
      currentSectorIndex: 0,
      totalSectors: SECTOR_KEYS.length,
      articlesScraped: 0,
      articlesInserted: 0,
      errors: [],
      phase: "scraping",
    });

    try {
      // Phase 1: Scrape Google News sector by sector
      for (let i = 0; i < SECTOR_KEYS.length; i++) {
        const sector = SECTOR_KEYS[i];
        const sectorLabel = SECTOR_LABELS[sector] || sector;

        setProgress((prev) => ({
          ...prev,
          currentSector: sectorLabel,
          currentSectorIndex: i + 1,
          phase: "scraping",
        }));

        try {
          const { data, error } = await supabase.functions.invoke("scrape-google-news", {
            body: { sector, articlesPerStock: 5, timePeriod: "qdr:m" },
          });

          if (error) {
            console.error(`Error scraping sector ${sector}:`, error);
            allErrors.push(`${sectorLabel}: ${error.message}`);
            continue;
          }

          totalScraped += data?.articles_scraped || 0;
          totalInserted += data?.articles_inserted || 0;

          if (data?.errors) {
            allErrors.push(...data.errors.map((e: string) => `${sectorLabel} - ${e}`));
          }

          setProgress((prev) => ({
            ...prev,
            articlesScraped: totalScraped,
            articlesInserted: totalInserted,
            errors: allErrors,
          }));
        } catch (sectorError: any) {
          console.error(`Failed sector ${sector}:`, sectorError);
          allErrors.push(`${sectorLabel}: ${sectorError.message || "Erreur inconnue"}`);
        }
      }

      // Phase 2: Analyze the new articles
      setProgress((prev) => ({
        ...prev,
        phase: "analyzing",
        currentSector: "Analyse en cours...",
      }));

      // Analyze in batches of 20
      let totalAnalyzed = 0;
      for (let offset = 0; offset < totalInserted; offset += 20) {
        try {
          const { data: analyzeResult, error: analyzeError } = await supabase.functions.invoke(
            "analyze-sentiment",
            { body: { limit: 20, offset } }
          );

          if (analyzeError) {
            console.error("Analyze error:", analyzeError);
            break;
          }

          totalAnalyzed += analyzeResult?.analyzed || 0;
          
          if (analyzeResult?.analyzed === 0) break;
        } catch (analyzeErr) {
          console.error("Analysis batch error:", analyzeErr);
          break;
        }
      }

      // Done
      setProgress((prev) => ({
        ...prev,
        phase: "done",
        currentSector: "Terminé",
      }));

      queryClient.invalidateQueries({ queryKey: ["sentiment-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["sentiment-by-stock"] });

      toast({
        title: "Scraping & Analyse terminés",
        description: `${totalScraped} articles scrapés, ${totalInserted} insérés, ${totalAnalyzed} analysés.`,
      });
    } catch (error: any) {
      console.error("Global scraping error:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  }, [queryClient, toast]);

  return { isRunning, progress, runScrapeAndAnalyze };
};
