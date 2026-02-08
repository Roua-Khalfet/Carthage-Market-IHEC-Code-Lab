import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, TrendingUp, Activity, Bell } from "lucide-react";

interface Anomaly {
  id: string;
  timestamp: string;
  type: "volume" | "price" | "news";
  stock: string;
  description: string;
  severity: "low" | "medium" | "high";
  value: number;
}

interface RealtimeAlertsProps {
  anomalies: Anomaly[];
  onAnomalyDetected?: (anomaly: Anomaly) => void;
}

const typeIcons = {
  volume: Activity,
  price: TrendingUp,
  news: Bell,
};

const severityConfig = {
  low: {
    title: "Anomalie Détectée",
    variant: "default" as const,
  },
  medium: {
    title: "⚠️ Anomalie Moyenne",
    variant: "default" as const,
  },
  high: {
    title: "🚨 ALERTE CRITIQUE",
    variant: "destructive" as const,
  },
};

export function RealtimeAlerts({ anomalies, onAnomalyDetected }: RealtimeAlertsProps) {
  useEffect(() => {
    if (anomalies.length === 0) return;

    // Simuler la détection d'une nouvelle anomalie (la plus récente)
    const latestAnomaly = anomalies[0];
    const now = new Date();
    const anomalyTime = new Date(latestAnomaly.timestamp);
    
    // Si l'anomalie est dans les 30 dernières secondes, afficher la notification
    if (now.getTime() - anomalyTime.getTime() < 30000) {
      const Icon = typeIcons[latestAnomaly.type];
      const config = severityConfig[latestAnomaly.severity];

      toast({
        title: config.title,
        description: (
          <div className="flex items-start gap-3 mt-2">
            <div className={`p-2 rounded-lg ${
              latestAnomaly.severity === "high" 
                ? "bg-red-500/20" 
                : latestAnomaly.severity === "medium"
                ? "bg-orange-500/20"
                : "bg-yellow-500/20"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">{latestAnomaly.stock}</div>
              <div className="text-sm text-muted-foreground">
                {latestAnomaly.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Type: {latestAnomaly.type} • Valeur: {
                  latestAnomaly.type === "price" 
                    ? `${latestAnomaly.value}%` 
                    : latestAnomaly.value
                }
              </div>
            </div>
          </div>
        ),
        variant: config.variant,
        duration: latestAnomaly.severity === "high" ? 10000 : 5000,
      });

      // Notification sonore pour les alertes critiques
      if (latestAnomaly.severity === "high" && "Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("🚨 Anomalie Critique Détectée", {
              body: `${latestAnomaly.stock}: ${latestAnomaly.description}`,
              icon: "/favicon.ico",
              tag: latestAnomaly.id,
            });
          }
        });
      }

      onAnomalyDetected?.(latestAnomaly);
    }
  }, [anomalies, onAnomalyDetected]);

  return null; // Ce composant ne rend rien visuellement
}
