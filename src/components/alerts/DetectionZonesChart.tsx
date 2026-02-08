import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

interface DetectionZone {
  timestamp: string;
  value: number;
  mean: number;
  upperThreshold: number;
  lowerThreshold: number;
  isAnomaly: boolean;
  sigma: number;
  type?: "volume" | "price";
}

interface DetectionZonesChartProps {
  data: DetectionZone[];
  title: string;
  type: "volume" | "price";
  threshold: number; // 3 pour volume, 5 pour prix
}

export function DetectionZonesChart({ data, title, type, threshold }: DetectionZonesChartProps) {
  const anomalies = data.filter(d => d.isAnomaly);
  
  const formatValue = (value: number) => {
    if (type === "price") return `${value.toFixed(2)}%`;
    return value.toLocaleString();
  };

  const Icon = type === "volume" ? Activity : type === "price" ? TrendingUp : Zap;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            Seuil: {type === "volume" ? `${threshold}σ` : `${threshold}%`}
          </Badge>
          <Badge variant="destructive" className="bg-red-500/10 text-red-500">
            {anomalies.length} anomalies
          </Badge>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("fr-FR", { 
                day: "2-digit", 
                month: "short",
                hour: "2-digit"
              });
            }}
          />
          
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={formatValue}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            formatter={(value: any) => [formatValue(value), ""]}
            labelFormatter={(value) => new Date(value).toLocaleString("fr-FR")}
          />
          
          {/* Zone de danger supérieure */}
          <Area
            type="monotone"
            dataKey="upperThreshold"
            stroke="none"
            fill="url(#colorDanger)"
          />
          
          {/* Seuil supérieur */}
          <ReferenceLine
            y={data[0]?.upperThreshold}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ 
              value: `+${threshold}${type === "volume" ? "σ" : "%"}`, 
              position: "right",
              fill: "#ef4444",
              fontSize: 11,
              fontWeight: "bold"
            }}
          />
          
          {/* Moyenne */}
          <ReferenceLine
            y={data[0]?.mean}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ 
              value: "Moyenne", 
              position: "right",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10
            }}
          />
          
          {/* Seuil inférieur */}
          {type === "volume" && (
            <ReferenceLine
              y={data[0]?.lowerThreshold}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: `-${threshold}σ`, 
                position: "right",
                fill: "#f59e0b",
                fontSize: 11,
                fontWeight: "bold"
              }}
            />
          )}
          
          {/* Ligne de valeur principale */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isAnomaly) {
                return (
                  <g>
                    {/* Effet de pulse */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={12}
                      fill="#ef4444"
                      opacity={0.2}
                      className="animate-ping"
                    />
                    {/* Point principal */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth={2.5}
                    />
                  </g>
                );
              }
              return null;
            }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Valeur actuelle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-muted-foreground"></div>
          <span>Moyenne mobile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span>Seuil d'alerte ({threshold}{type === "volume" ? "σ" : "%"})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Anomalie détectée</span>
        </div>
      </div>
    </Card>
  );
}
