import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  totalAnomalies: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

interface ModelPerformanceProps {
  metrics: ModelMetrics;
}

export function ModelPerformance({ metrics }: ModelPerformanceProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return "bg-green-500/10";
    if (score >= 0.6) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Performance du Modèle ML</h3>
          <p className="text-sm text-muted-foreground">
            Isolation Forest + Règles Métier (3σ volume, 5% prix)
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          Temps Réel
        </Badge>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getScoreBg(metrics.precision)}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className={`w-4 h-4 ${getScoreColor(metrics.precision)}`} />
            <span className="text-sm font-medium text-muted-foreground">Precision</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(metrics.precision)}`}>
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.truePositives} vraies / {metrics.truePositives + metrics.falsePositives} détectées
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${getScoreBg(metrics.recall)}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={`w-4 h-4 ${getScoreColor(metrics.recall)}`} />
            <span className="text-sm font-medium text-muted-foreground">Recall</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(metrics.recall)}`}>
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.truePositives} détectées / {metrics.truePositives + metrics.falseNegatives} réelles
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${getScoreBg(metrics.f1Score)}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${getScoreColor(metrics.f1Score)}`} />
            <span className="text-sm font-medium text-muted-foreground">F1-Score</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(metrics.f1Score)}`}>
            {(metrics.f1Score * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Moyenne harmonique P/R
          </p>
        </div>
      </div>

      {/* Statistiques Détaillées */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
          <span className="text-sm text-muted-foreground">Total Anomalies</span>
          <span className="font-semibold">{metrics.totalAnomalies}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
          <span className="text-sm text-muted-foreground">Vrais Positifs</span>
          <span className="font-semibold text-green-500">{metrics.truePositives}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
          <span className="text-sm text-muted-foreground">Faux Positifs</span>
          <span className="font-semibold text-yellow-500">{metrics.falsePositives}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
          <span className="text-sm text-muted-foreground">Faux Négatifs</span>
          <span className="font-semibold text-red-500">{metrics.falseNegatives}</span>
        </div>
      </div>

      {/* Indicateur de Performance Globale */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance Globale</span>
          <div className="flex items-center gap-2">
            {metrics.f1Score >= 0.77 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Excellent</span>
              </>
            ) : metrics.f1Score >= 0.6 ? (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-500 font-medium">Bon</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-medium">À améliorer</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 h-2 bg-accent rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metrics.f1Score >= 0.77
                ? "bg-green-500"
                : metrics.f1Score >= 0.6
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${metrics.f1Score * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
