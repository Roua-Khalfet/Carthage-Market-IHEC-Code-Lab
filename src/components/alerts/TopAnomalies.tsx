import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";

interface TopAnomaly {
  id: string;
  stock: string;
  type: "volume" | "price";
  value: number;
  deviation: number;
  timestamp: string;
}

interface TopAnomaliesProps {
  anomalies: TopAnomaly[];
}

export function TopAnomalies({ anomalies }: TopAnomaliesProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Top 5 Anomalies Aujourd'hui</h3>
      </div>

      <div className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aucune anomalie détectée aujourd'hui</p>
          </div>
        ) : (
          anomalies.map((anomaly, idx) => (
            <div
              key={anomaly.id}
              className="p-4 rounded-lg border bg-gradient-to-r from-red-500/5 to-transparent hover:from-red-500/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{anomaly.stock}</span>
                      <Badge variant="outline" className="text-xs">
                        {anomaly.type === "volume" ? (
                          <Activity className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        )}
                        {anomaly.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-500">
                    {anomaly.type === "price" ? `${anomaly.value > 0 ? "+" : ""}${anomaly.value}%` : anomaly.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {anomaly.deviation.toFixed(1)}σ
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
