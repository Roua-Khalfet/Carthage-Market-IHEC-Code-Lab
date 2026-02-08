/**
 * Composant pour afficher les métriques réelles de détection
 * Utilise les données de surveillance_alerts_2025.json
 */

import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MetricsSummaryProps {
  summary?: {
    total_alerts: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
    total_trading_days: number;
    total_stocks: number;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export function RealMetricsSummary({ summary }: MetricsSummaryProps) {
  if (!summary) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Chargement des métriques...</p>
      </Card>
    );
  }

  const detectionRate = (summary.total_alerts / (summary.total_trading_days * summary.total_stocks) * 100).toFixed(2);
  
  const stats = [
    {
      icon: AlertTriangle,
      label: "Total Anomalies",
      value: summary.total_alerts.toLocaleString(),
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Activity,
      label: "Taux de Détection",
      value: `${detectionRate}%`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: TrendingUp,
      label: "Actions Surveillées",
      value: summary.total_stocks.toString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Clock,
      label: "Jours de Trading",
      value: summary.total_trading_days.toString(),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Répartition par Type
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.by_type).map(([type, count]) => {
              const percentage = (count / summary.total_alerts * 100).toFixed(1);
              const typeLabels: Record<string, string> = {
                price: '💰 Prix',
                volume: '📊 Volume',
                ml: '🤖 ML',
                relational: '🌐 Cross-Asset',
                liquidity: '💧 Liquidité'
              };
              
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{typeLabels[type] || type}</span>
                    <span className="font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* By Severity */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Répartition par Sévérité
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.by_severity).map(([severity, count]) => {
              const percentage = (count / summary.total_alerts * 100).toFixed(1);
              const severityConfig: Record<string, { label: string; color: string }> = {
                high: { label: '🔴 Critique', color: 'bg-red-500' },
                medium: { label: '🟡 Moyen', color: 'bg-orange-500' },
                low: { label: '🟢 Faible', color: 'bg-green-500' }
              };
              
              const config = severityConfig[severity];
              
              return (
                <div key={severity} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{config.label}</span>
                    <span className="font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className={`h-full ${config.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Date Range */}
      <Card className="p-4 bg-secondary/50">
        <p className="text-sm text-center">
          <Clock className="inline h-4 w-4 mr-2" />
          Période analysée: <span className="font-semibold">{summary.date_range.start}</span> → <span className="font-semibold">{summary.date_range.end}</span>
        </p>
      </Card>
    </div>
  );
}
