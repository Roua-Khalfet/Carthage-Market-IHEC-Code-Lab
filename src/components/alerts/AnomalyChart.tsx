import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  timestamp: string;
  value: number;
  isAnomaly?: boolean;
  threshold?: number;
}

interface AnomalyChartProps {
  data: DataPoint[];
  title: string;
  stockName?: string;
}

export function AnomalyChart({ data, title, stockName }: AnomalyChartProps) {
  const anomalies = data.filter(d => d.isAnomaly);
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
          {stockName && (
            <Badge variant="outline" className="ml-2">
              {stockName}
            </Badge>
          )}
        </div>
        <Badge variant="destructive" className="bg-red-500/10 text-red-500">
          {anomalies.length} anomalies détectées
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("fr-FR", { 
                day: "2-digit", 
                month: "short" 
              });
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          
          {/* Ligne de seuil si disponible */}
          {data[0]?.threshold && (
            <ReferenceLine
              y={data[0].threshold}
              stroke="hsl(var(--destructive))"
              strokeDasharray="5 5"
              label={{ value: "Seuil", position: "right" }}
            />
          )}
          
          {/* Ligne principale */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isAnomaly) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="hsl(var(--destructive))"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Valeur normale</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive"></div>
          <span>Anomalie détectée</span>
        </div>
      </div>
    </Card>
  );
}
