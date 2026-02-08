import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Anomaly {
  id: string;
  timestamp: string;
  type: "volume" | "price" | "news";
  stock: string;
  description: string;
  severity: "low" | "medium" | "high";
  value: number;
  deviation: number;
  isResolved: boolean;
}

export interface AnomalyStats {
  total: number;
  byType: {
    volume: number;
    price: number;
    news: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Hook pour récupérer les anomalies en temps réel
 */
export function useAnomalyDetection() {
  const { data: anomalies, isLoading, error } = useQuery({
    queryKey: ["anomalies"],
    queryFn: async () => {
      // TODO: Remplacer par un vrai appel API
      // const { data, error } = await supabase
      //   .from("anomalies")
      //   .select("*")
      //   .order("timestamp", { ascending: false })
      //   .limit(100);
      
      // if (error) throw error;
      // return data as Anomaly[];

      // Données mockées pour la démonstration
      return generateMockAnomalies();
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const stats: AnomalyStats = {
    total: anomalies?.length || 0,
    byType: {
      volume: anomalies?.filter(a => a.type === "volume").length || 0,
      price: anomalies?.filter(a => a.type === "price").length || 0,
      news: anomalies?.filter(a => a.type === "news").length || 0,
    },
    bySeverity: {
      low: anomalies?.filter(a => a.severity === "low").length || 0,
      medium: anomalies?.filter(a => a.severity === "medium").length || 0,
      high: anomalies?.filter(a => a.severity === "high").length || 0,
    },
  };

  return {
    anomalies: anomalies || [],
    stats,
    isLoading,
    error,
  };
}

/**
 * Hook pour détecter les anomalies sur des données spécifiques
 */
export function useDetectAnomalies(data: any[], config?: {
  volumeThreshold?: number;
  priceThreshold?: number;
}) {
  return useQuery({
    queryKey: ["detectAnomalies", data, config],
    queryFn: async () => {
      // Logique de détection d'anomalies
      const volumeThreshold = config?.volumeThreshold || 3; // 3σ
      const priceThreshold = config?.priceThreshold || 5; // 5%

      // TODO: Implémenter la vraie logique de détection
      // Pour l'instant, retourne les données mockées
      return detectAnomaliesInData(data, volumeThreshold, priceThreshold);
    },
    enabled: data.length > 0,
  });
}

// Fonctions utilitaires

function generateMockAnomalies(): Anomaly[] {
  const stocks = ["BIAT", "BNA", "ATB", "UIB", "SFBT", "STB"];
  const types: Array<"volume" | "price" | "news"> = ["volume", "price", "news"];
  const severities: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `anomaly-${i}`,
    timestamp: new Date(Date.now() - i * 300000).toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    stock: stocks[Math.floor(Math.random() * stocks.length)],
    description: generateAnomalyDescription(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    value: Math.random() * 100,
    deviation: Math.random() * 5 + 2,
    isResolved: Math.random() > 0.7,
  }));
}

function generateAnomalyDescription(): string {
  const descriptions = [
    "Pic de volume anormal détecté",
    "Variation de prix inhabituelle sans news",
    "Volume extrêmement faible",
    "Mouvement de prix suspect",
    "Pattern d'ordres inhabituel",
    "Spike de sentiment négatif",
    "Divergence avec le secteur",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function detectAnomaliesInData(
  data: any[],
  volumeThreshold: number,
  priceThreshold: number
): Anomaly[] {
  // TODO: Implémenter la vraie logique de détection
  // - Calculer moyenne et écart-type
  // - Détecter les valeurs > volumeThreshold σ
  // - Détecter les variations de prix > priceThreshold %
  
  return [];
}
