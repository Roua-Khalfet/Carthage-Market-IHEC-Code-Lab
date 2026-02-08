import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, BarChart3, Brain, Briefcase, Wallet } from "lucide-react";
import { useSentimentData } from "@/hooks/useSentimentData";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { SentimentDistribution } from "@/components/dashboard/SentimentDistribution";
import { SectorHeatmap } from "@/components/dashboard/SectorHeatmap";
import { SentimentTimeline } from "@/components/dashboard/SentimentTimeline";
import { RecentArticles } from "@/components/dashboard/RecentArticles";
import { StockSelector } from "@/components/dashboard/StockSelector";
import { StockAnalysisPanel } from "@/components/dashboard/StockAnalysisPanel";
import { MarketDataTable } from "@/components/dashboard/MarketDataTable";
import { SimulationTab } from "@/components/simulation/SimulationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { data, isLoading } = useSentimentData();
  const { role } = useAuth();
  const [selectedStock, setSelectedStock] = useState("");

  // Compute global timeline — filter from 2025-01 onwards
  const globalTimeline = useMemo(() => {
    if (!data?.length) return [];
    const dailyScores = new Map<string, { total: number; count: number }>();
    for (const d of data) {
      let date = d.published_date || d.analyzed_at.slice(0, 10);
      // Normalize to yyyy-mm-dd format for consistent sorting
      if (date.includes("/")) {
        const parts = date.split("/");
        if (parts.length === 3) {
          // dd/mm/yyyy -> yyyy-mm-dd
          date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      // Filter: only dates from 2025-01-01 onwards
      if (date < "2025-01-01") continue;
      const existing = dailyScores.get(date) || { total: 0, count: 0 };
      existing.total += Number(d.sentiment_score);
      existing.count += 1;
      dailyScores.set(date, existing);
    }
    return Array.from(dailyScores.entries())
      .map(([date, { total, count }]) => ({
        date,
        score: Number((total / count).toFixed(2)),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Ascending order (oldest to newest)
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sentimentData = data || [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <Header />

      {/* Main Tabs: Portfolio (investors only), Sentiment, Market Data */}
      <Tabs defaultValue={role === "investisseur" ? "portfolio" : "sentiment"} className="w-full">
        <TabsList className="bg-secondary/50 mb-6">
          {/* Portfolio tab - only for investors */}
          {role === "investisseur" && (
            <TabsTrigger value="portfolio" className="text-sm gap-1.5">
              <Wallet className="w-4 h-4" />
              Mon Portefeuille
            </TabsTrigger>
          )}
          <TabsTrigger value="sentiment" className="text-sm gap-1.5">
            <Brain className="w-4 h-4" />
            Analyse de Sentiment
          </TabsTrigger>
          <TabsTrigger value="market" className="text-sm gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Données de Marché
          </TabsTrigger>
        </TabsList>

        {/* ===== PORTFOLIO TAB ===== (only for investors) */}
        {role === "investisseur" && (
          <TabsContent value="portfolio" className="mt-0">
            <SimulationTab />
          </TabsContent>
        )}

        {/* ===== SENTIMENT TAB ===== */}
        <TabsContent value="sentiment" className="mt-0 space-y-6">
          {/* Global Market Overview */}
          <section className="animate-fade-in">
            <MarketOverview data={sentimentData} />
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SentimentTimeline data={globalTimeline} title="Sentiment Global du Marché" />
            </div>
            <SentimentDistribution data={sentimentData} />
          </section>

          {/* Sector Heatmap */}
          <section>
            <SectorHeatmap data={sentimentData} />
          </section>

          {/* Stock Analysis Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              Analyse d'une Valeur Spécifique
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <StockSelector selectedStock={selectedStock} onSelectStock={setSelectedStock} />
              </div>
              <div className="lg:col-span-2">
                {selectedStock ? (
                  <StockAnalysisPanel stockName={selectedStock} />
                ) : (
                  <div className="glass-card rounded-lg p-8 flex items-center justify-center h-full min-h-[300px]">
                    <p className="text-muted-foreground text-sm text-center">
                      ← Sélectionnez une valeur pour voir son analyse détaillée
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Recent Articles */}
          <section>
            <RecentArticles articles={sentimentData} title="Derniers Articles Analysés" />
          </section>
        </TabsContent>

        {/* ===== MARKET DATA TAB ===== */}
        <TabsContent value="market" className="mt-0">
          <MarketDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
