/**
 * Hook pour charger les vraies données d'alertes depuis le backend
 * Utilise les données exportées par le notebook Python (surveillance_alerts_2025.json)
 */

import { useState, useEffect, useMemo } from 'react';

export interface AlertMetrics {
  daily_return: number;
  daily_return_pct: number;
  volume_zscore: number;
  capital_zscore: number;
  transaction_intensity: number;
  mean_correlation?: number | null;
}

export interface AlertContext {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  nb_transactions: number;
  capital: number;
}

export interface Alert {
  id: string;
  timestamp: string;
  ticker: string;
  company_name: string;
  type: 'price' | 'volume' | 'liquidity' | 'relational' | 'ml';
  severity: 'high' | 'medium' | 'low';
  description: string;
  metrics: AlertMetrics;
  context: AlertContext;
}

export interface AlertsSummary {
  total_alerts: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  by_ticker: Record<string, number>;
  date_range: {
    start: string;
    end: string;
  };
  total_trading_days: number;
  total_stocks: number;
}

export interface DailyStats {
  date: string;
  total_anomalies: number;
  by_type: Record<string, number>;
  avg_volume_zscore: number;
  max_return: number;
  min_return: number;
}

export interface AlertsData {
  alerts: Alert[];
  summary: AlertsSummary;
  daily_stats: DailyStats[];
  top_anomalies: Alert[];
  metadata?: {
    generated_at: string;
    model: string;
    contamination: number;
    features: string[];
  };
}

/**
 * Hook pour charger et gérer les données d'alertes réelles
 */
export const useRealAlertsData = () => {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Essayer de charger le fichier JSON généré par le notebook
        const response = await fetch('/src/data/surveillance_alerts_2025.json');
        
        if (!response.ok) {
          throw new Error('Fichier de données non trouvé. Exécutez le notebook Python d\'abord.');
        }
        
        const jsonData: AlertsData = await response.json();
        
        // Validation basique
        if (!jsonData.alerts || !Array.isArray(jsonData.alerts)) {
          throw new Error('Format de données invalide');
        }
        
        setData(jsonData);
        setError(null);
        
        console.log('✅ Données BVMT 2025 chargées:', {
          totalAlerts: jsonData.alerts.length,
          period: jsonData.summary.date_range,
          stocks: jsonData.summary.total_stocks
        });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.error('❌ Erreur chargement données:', errorMessage);
        
        // Données de fallback minimales pour ne pas casser l'interface
        setData({
          alerts: [],
          summary: {
            total_alerts: 0,
            by_type: {},
            by_severity: {},
            by_ticker: {},
            date_range: { start: '2025-01-01', end: '2025-12-31' },
            total_trading_days: 0,
            total_stocks: 0
          },
          daily_stats: [],
          top_anomalies: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

/**
 * Hook pour obtenir les alertes filtrées
 */
export const useFilteredAlerts = (
  alerts: Alert[],
  filters: {
    types?: string[];
    severity?: string[];
    ticker?: string;
    dateRange?: { start: Date; end: Date };
  }
) => {
  return useMemo(() => {
    let filtered = [...alerts];

    // Filtre par type
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(a => filters.types!.includes(a.type));
    }

    // Filtre par sévérité
    if (filters.severity && filters.severity.length > 0) {
      filtered = filtered.filter(a => filters.severity!.includes(a.severity));
    }

    // Filtre par ticker
    if (filters.ticker) {
      filtered = filtered.filter(a => 
        a.ticker.toLowerCase().includes(filters.ticker!.toLowerCase()) ||
        a.company_name.toLowerCase().includes(filters.ticker!.toLowerCase())
      );
    }

    // Filtre par date
    if (filters.dateRange) {
      filtered = filtered.filter(a => {
        const alertDate = new Date(a.timestamp);
        return alertDate >= filters.dateRange!.start && alertDate <= filters.dateRange!.end;
      });
    }

    return filtered;
  }, [alerts, filters]);
};

/**
 * Hook pour obtenir les statistiques des alertes
 */
export const useAlertsStats = (alerts: Alert[]) => {
  return useMemo(() => {
    const stats = {
      total: alerts.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byTicker: {} as Record<string, number>,
      avgVolumeZScore: 0,
      avgPriceChange: 0
    };

    let totalVolumeZScore = 0;
    let totalPriceChange = 0;

    alerts.forEach(alert => {
      // Par type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      // Par sévérité
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Par ticker
      stats.byTicker[alert.ticker] = (stats.byTicker[alert.ticker] || 0) + 1;
      
      // Moyennes
      totalVolumeZScore += alert.metrics.volume_zscore;
      totalPriceChange += Math.abs(alert.metrics.daily_return_pct);
    });

    stats.avgVolumeZScore = totalVolumeZScore / alerts.length || 0;
    stats.avgPriceChange = totalPriceChange / alerts.length || 0;

    return stats;
  }, [alerts]);
};
