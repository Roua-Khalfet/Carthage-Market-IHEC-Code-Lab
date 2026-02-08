import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";

interface AnomalyVisualizationProps {
  data?: {
    date: string;
    close: number;
    isAnomaly: boolean;
    riskScore?: number;
    volume?: number;
  }[];
  ticker?: string;
  companyName?: string;
}

export function AnomalyVisualization({
  data = [],
  ticker = "SAMPLE",
  companyName = "Sample Company",
}: AnomalyVisualizationProps) {
  // Données mock si non fournies
  const sampleData = data.length > 0 ? data : generateSampleData();

  // Séparer anomalies et données normales
  const anomalies = sampleData.filter((d) => d.isAnomaly);
  const normalData = sampleData.map((d) => ({
    ...d,
    closeValue: d.isAnomaly ? null : d.close,
  }));

  return (
    <div className="space-y-6">
      {/* Graphique principal: Prix avec zones d'alerte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {companyName} ({ticker})
            </span>
            <div className="flex gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Prix</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Anomalies</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={normalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
                tickFormatter={(value) => `${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(2)} TND`, "Prix"]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }
              />
              <Legend />

              {/* Ligne de prix normale */}
              <Line
                type="monotone"
                dataKey="closeValue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Prix clôture"
              />

              {/* Points rouges pour les anomalies */}
              {anomalies.map((anomaly, index) => (
                <Scatter
                  key={`anomaly-${index}`}
                  data={[anomaly]}
                  fill="#ef4444"
                  shape="circle"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Légende des anomalies */}
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-red-900">
                {anomalies.length} anomalies détectées
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {anomalies.slice(0, 4).map((anomaly, index) => (
                <div key={index} className="text-red-700">
                  {new Date(anomaly.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                  : {anomaly.close.toFixed(2)} TND
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphique de volume avec anomalies */}
      <Card>
        <CardHeader>
          <CardTitle>Volume de transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter plot: Risk Score vs Return */}
      {sampleData.some((d) => d.riskScore) && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse Risque vs Rendement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="riskScore"
                  name="Score de Risque"
                  tick={{ fontSize: 12 }}
                />
                <YAxis dataKey="close" name="Prix" tick={{ fontSize: 12 }} />
                <ZAxis range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Scatter
                  data={sampleData.filter((d) => d.isAnomaly)}
                  fill="#ef4444"
                  name="Anomalies"
                />
                <Scatter
                  data={sampleData.filter((d) => !d.isAnomaly)}
                  fill="#3b82f6"
                  name="Normal"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Fonction helper pour générer des données d'exemple
function generateSampleData() {
  const data = [];
  const basePrice = 2.1;
  const startDate = new Date("2025-01-02");

  for (let i = 0; i < 60; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Générer prix avec tendance et volatilité
    const trend = Math.sin(i / 10) * 0.2;
    const volatility = (Math.random() - 0.5) * 0.1;
    const price = basePrice + trend + volatility;

    // Anomalies aléatoires (5%)
    const isAnomaly = Math.random() < 0.05;
    const anomalyBoost = isAnomaly ? (Math.random() > 0.5 ? 0.3 : -0.3) : 0;

    data.push({
      date: date.toISOString().split("T")[0],
      close: price + anomalyBoost,
      isAnomaly,
      riskScore: isAnomaly ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }

  return data;
}
