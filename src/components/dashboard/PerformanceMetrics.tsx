import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Target, AlertTriangle, CheckCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PerformanceMetricsProps {
  metrics?: {
    precision: number;
    recall: number;
    f1Score: number;
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    falsePositiveRate: number;
  };
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  // Données par défaut si non fournies
  const defaultMetrics = {
    precision: 0.78,
    recall: 0.85,
    f1Score: 0.81,
    truePositives: 242,
    falsePositives: 68,
    trueNegatives: 4580,
    falseNegatives: 90,
    falsePositiveRate: 1.46,
  };

  const data = metrics || defaultMetrics;

  // Données pour le graphique
  const chartData = [
    { name: "Precision", value: data.precision * 100, fill: "#3b82f6" },
    { name: "Recall", value: data.recall * 100, fill: "#10b981" },
    { name: "F1-Score", value: data.f1Score * 100, fill: "#8b5cf6" },
  ];

  // Matrice de confusion pour visualisation
  const confusionData = [
    { category: "TP", value: data.truePositives, color: "bg-green-500" },
    { category: "FP", value: data.falsePositives, color: "bg-orange-500" },
    { category: "TN", value: data.trueNegatives, color: "bg-blue-500" },
    { category: "FN", value: data.falseNegatives, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Precision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {(data.precision * 100).toFixed(1)}%
                </span>
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Exactitude des détections
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {(data.recall * 100).toFixed(1)}%
                </span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Couverture des anomalies
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                F1-Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600">
                  {(data.f1Score * 100).toFixed(1)}%
                </span>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Équilibre precision/recall
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphique de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance du Modèle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Matrice de confusion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matrice de Confusion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {confusionData.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${item.color} rounded-lg p-6 text-white`}
              >
                <div className="text-sm font-medium opacity-90">
                  {item.category === "TP"
                    ? "True Positives"
                    : item.category === "FP"
                    ? "False Positives"
                    : item.category === "TN"
                    ? "True Negatives"
                    : "False Negatives"}
                </div>
                <div className="text-4xl font-bold mt-2">{item.value}</div>
                <div className="text-xs opacity-75 mt-1">
                  {item.category === "TP"
                    ? "Anomalies correctement détectées"
                    : item.category === "FP"
                    ? "Fausses alertes"
                    : item.category === "TN"
                    ? "Normal correctement identifié"
                    : "Anomalies manquées"}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-900">
                Taux Faux Positifs: {data.falsePositiveRate.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Sur 100 prédictions d'anomalies, environ {data.falsePositiveRate.toFixed(0)} sont
              des fausses alertes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
