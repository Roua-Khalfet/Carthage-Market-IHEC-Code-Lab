import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AnomalyFeed } from "@/components/alerts/AnomalyFeed";
import { AnomalyFilters } from "@/components/alerts/AnomalyFilters";
import { AnomalyHistory } from "@/components/alerts/AnomalyHistory";
import { StockSelector } from "@/components/alerts/StockSelector";
import { DetectionZonesChart } from "@/components/alerts/DetectionZonesChart";
import { TopAnomalies } from "@/components/alerts/TopAnomalies";
import { RealtimeAlerts } from "@/components/alerts/RealtimeAlerts";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { AnomalyVisualization } from "@/components/dashboard/AnomalyVisualization";
import { RealMetricsSummary } from "@/components/dashboard/RealMetricsSummary";
import { AlertTriangle, ArrowLeft, Zap, Database, TrendingUp, Target, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealAlertsData, useFilteredAlerts, useAlertsStats } from "@/hooks/useRealAlertsData";
import { Alert } from "@/components/ui/alert";

// Fallback: Données mockées si le fichier JSON n'existe pas encore
const mockAnomalies = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    type: "volume" as const,
    stock: "BIAT",
    description: "Pic de volume anormal: 3.2σ au-dessus de la moyenne (Isolation Forest)",
    severity: "high" as const,
    value: 25000,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: "price" as const,
    stock: "BNA",
    description: "Variation de prix de 7.5% en 1h sans news significative",
    severity: "high" as const,
    value: 7.5,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    type: "volume" as const,
    stock: "SFBT",
    description: "Volume inhabituellement faible: -2.8σ",
    severity: "medium" as const,
    value: 450,
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: "price" as const,
    stock: "ATB",
    description: "Variation soudaine de -5.2% détectée",
    severity: "medium" as const,
    value: -5.2,
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    type: "news" as const,
    stock: "UIB",
    description: "Spike de sentiment négatif détecté dans les news",
    severity: "low" as const,
    value: -0.75,
  },
];

const mockHistory = [
  {
    id: "h1",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    stock: "BIAT",
    type: "volume",
    description: "Pic de volume exceptionnel",
    severity: "high" as const,
    action: "resolved" as const,
    actionDetails: "Transaction confirmée par l'émetteur",
  },
  {
    id: "h2",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    stock: "BNA",
    type: "price",
    description: "Mouvement de prix inhabituel",
    severity: "medium" as const,
    action: "dismissed" as const,
    actionDetails: "Fluctuation liée à l'annonce de résultats",
  },
  {
    id: "h3",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    stock: "ATB",
    type: "volume",
    description: "Volume anormalement bas",
    severity: "low" as const,
    action: "pending" as const,
  },
];

const mockChartData = Array.from({ length: 30 }, (_, i) => {
  const isAnomaly = [5, 12, 20, 27].includes(i);
  const mean = 100;
  const sigma = 15;
  return {
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: mean + (Math.random() - 0.5) * 40 + (isAnomaly ? sigma * 3.5 : 0),
    mean: mean,
    upperThreshold: mean + sigma * 3, // 3σ
    lowerThreshold: mean - sigma * 3,
    isAnomaly,
    sigma: isAnomaly ? 3.2 + Math.random() : Math.random() * 2,
  };
});

const mockPriceData = Array.from({ length: 30 }, (_, i) => {
  const isAnomaly = [3, 15, 23].includes(i);
  return {
    timestamp: new Date(Date.now() - (29 - i) * 3600000).toISOString(), // Horaire
    value: (Math.random() - 0.5) * 10 + (isAnomaly ? 7 : 0),
    mean: 0,
    upperThreshold: 5, // 5%
    lowerThreshold: -5,
    isAnomaly,
    sigma: 0,
    type: "price" as const,
  };
});

// Métriques du modèle ML - basées sur le backend
const mockTopAnomalies = [
  {
    id: "t1",
    stock: "BIAT",
    type: "volume" as const,
    value: 35000,
    deviation: 4.2,
    timestamp: new Date().toISOString(),
  },
  {
    id: "t2",
    stock: "BNA",
    type: "price" as const,
    value: 8.5,
    deviation: 3.8,
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "t3",
    stock: "ATB",
    type: "volume" as const,
    value: 28000,
    deviation: 3.5,
    timestamp: new Date(Date.now() - 360000).toISOString(),
  },
  {
    id: "t4",
    stock: "UIB",
    type: "price" as const,
    value: -6.2,
    deviation: 3.2,
    timestamp: new Date(Date.now() - 540000).toISOString(),
  },
  {
    id: "t5",
    stock: "SFBT",
    type: "volume" as const,
    value: 22000,
    deviation: 3.0,
    timestamp: new Date(Date.now() - 720000).toISOString(),
  },
];

export default function Alerts() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('all');
  
  // Charger les vraies données depuis le notebook Python
  const { data: alertsData, loading, error } = useRealAlertsData();
  
  // Utiliser les vraies données ou fallback sur mock
  const allAlerts = alertsData?.alerts || mockAnomalies;
  const summary = alertsData?.summary;

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // Convertir Alert vers Anomaly (format attendu par les composants)
  const anomalies = useMemo(() => {
    return allAlerts.map((alert: any) => ({
      id: alert.id,
      timestamp: alert.timestamp,
      type: alert.type,
      stock: alert.company_name || alert.stock || 'Unknown',
      description: alert.description,
      severity: alert.severity,
      value: alert.metrics?.daily_return_pct || alert.value || 0,
    }));
  }, [allAlerts]);

  const filteredAnomalies = useMemo(() => {
    let filtered = anomalies;
    
    // Filtre par type
    if (activeFilters.length > 0) {
      filtered = filtered.filter((a) => activeFilters.includes(a.type));
    }
    
    // Filtre par société
    if (selectedStock !== 'all') {
      filtered = filtered.filter((a) => a.stock === selectedStock);
    }
    
    return filtered;
  }, [activeFilters, selectedStock, anomalies]);

  const filterCounts = useMemo(() => {
    return {
      volume: allAlerts.filter((a) => a.type === "volume").length,
      price: allAlerts.filter((a) => a.type === "price").length,
      news: 0, // Placeholder pour le moment (sera ajouté avec scraping)
      liquidity: allAlerts.filter((a) => a.type === "liquidity").length,
      relational: allAlerts.filter((a) => a.type === "relational").length,
      ml: allAlerts.filter((a) => a.type === "ml").length,
    };
  }, [allAlerts]);

  // Liste des sociétés avec nombre d'anomalies
  const stocksList = useMemo(() => {
    const stocksMap = new Map<string, { ticker: string; company_name: string; count: number }>();
    
    allAlerts.forEach((alert: any) => {
      const company = alert.company_name || alert.stock || 'Unknown';
      const ticker = alert.ticker || '';
      
      if (stocksMap.has(company)) {
        stocksMap.get(company)!.count++;
      } else {
        stocksMap.set(company, { ticker, company_name: company, count: 1 });
      }
    });
    
    return Array.from(stocksMap.values());
  }, [allAlerts]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
      {/* Système d'alertes en temps réel (notifications) */}
      <RealtimeAlerts 
        anomalies={filteredAnomalies} 
        onAnomalyDetected={(anomaly) => console.log("Nouvelle anomalie:", anomaly)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Button>
        </Link>
        
        {/* Indicateur de source des données */}
        {error && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
            <XCircle className="w-4 h-4 text-yellow-600" />
            <div className="ml-2">
              <p className="font-semibold text-yellow-700">Données de démonstration</p>
              <p className="text-sm text-yellow-600">
                {error} - Affichage des données mockées. Exécutez <code className="bg-yellow-100 px-1 rounded">python backend/test_detection.py</code>
              </p>
            </div>
          </Alert>
        )}
        
        {!error && alertsData && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="ml-2">
              <p className="font-semibold text-green-700">✅ Données réelles BVMT 2025</p>
              <p className="text-sm text-green-600">
                {alertsData.summary.total_alerts} anomalies | {alertsData.summary.total_stocks} sociétés | {alertsData.summary.total_trading_days} jours{alertsData.metadata ? ` | Généré: ${alertsData.metadata.generated_at}` : ''}
              </p>
            </div>
          </Alert>
        )}
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertTriangle className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Surveillance & Alertes - BVMT 2025</h1>
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
            <Zap className="w-3 h-3" />
            Temps Réel
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Détection ML (Isolation Forest) + Règles Métier : Pics de volume (&gt;3σ), Variations de prix (&gt;5%), Patterns suspects
        </p>
      </motion.div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">🚨 Feed d'Alertes</TabsTrigger>
          <TabsTrigger value="charts">📈 Visualisations</TabsTrigger>
          <TabsTrigger value="history">📜 Historique</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Top Anomalies Today */}
          <TopAnomalies anomalies={mockTopAnomalies} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <AnomalyFilters
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
                counts={filterCounts}
              />
              
              <StockSelector
                selectedStock={selectedStock}
                onStockChange={setSelectedStock}
                stocks={stocksList}
              />
            </motion.div>

            {/* Feed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <AnomalyFeed anomalies={filteredAnomalies} />
            </motion.div>
          </div>

          {/* Charts avec Zones de Détection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DetectionZonesChart
              data={mockChartData}
              title="Détection de Pics de Volume"
              type="volume"
              threshold={3}
            />

            <DetectionZonesChart
              data={mockPriceData}
              title="Détection de Variations de Prix"
              type="price"
              threshold={5}
            />
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <StockSelector
              selectedStock={selectedStock}
              onStockChange={setSelectedStock}
              stocks={stocksList}
            />
            
            <div className="lg:col-span-3">
              <AnomalyVisualization
                ticker={selectedStock !== 'all' ? stocksList.find(s => s.company_name === selectedStock)?.ticker || 'BIAT' : 'BIAT'}
                companyName={selectedStock !== 'all' ? selectedStock : 'Toutes les sociétés'}
              />
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <AnomalyHistory records={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
