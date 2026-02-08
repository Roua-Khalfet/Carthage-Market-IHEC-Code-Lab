import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, TrendingUp, Activity, Bell, Brain, Link2, Droplet } from "lucide-react";
import { motion } from "framer-motion";

interface Anomaly {
  id: string;
  timestamp: string;
  type: "volume" | "price" | "news" | "ml" | "relational" | "liquidity";
  stock: string;
  description: string;
  severity: "low" | "medium" | "high";
  value: number;
}

interface AnomalyFeedProps {
  anomalies: Anomaly[];
}

const typeIcons = {
  volume: Activity,
  price: TrendingUp,
  news: Bell,
  ml: Brain,
  relational: Link2,
  liquidity: Droplet,
};

const severityColors = {
  low: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function AnomalyFeed({ anomalies }: AnomalyFeedProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Feed en Temps Réel</h3>
        <Badge variant="secondary" className="ml-auto">
          {anomalies.length} anomalies
        </Badge>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {anomalies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Aucune anomalie détectée</p>
            </div>
          ) : (
            anomalies.map((anomaly, idx) => {
              const Icon = typeIcons[anomaly.type];
              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        severityColors[anomaly.severity]
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {anomaly.stock}
                        </span>
                        <Badge
                          variant="outline"
                          className={severityColors[anomaly.severity]}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {anomaly.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                        <span className="font-mono">
                          {anomaly.type === "price" ? `${anomaly.value}%` : anomaly.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
