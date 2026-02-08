/**
 * Types TypeScript centralisés pour Carthage Market Intelligence
 */

import type {
  RiskProfile,
  UserRole,
  SentimentLabel,
  RecommendationAction,
  AlertType,
  AlertSeverity,
} from '@/lib/constants';

/**
 * Profil utilisateur
 */
export interface UserProfile {
  id: string;
  role: UserRole;
  risk_profile?: RiskProfile;
  has_completed_quiz: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Réponse au quiz de profil
 */
export interface QuizResponse {
  id: string;
  user_id: string;
  question_number: number;
  selected_answer: string;
  risk_weight: number;
  created_at: string;
}

/**
 * Article de presse
 */
export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  content?: string;
  published_date?: string;
  stock_symbol?: string;
  sentiment?: number;
  sentiment_label?: SentimentLabel;
  source: string;
  created_at: string;
}

/**
 * Analyse de sentiment agrégée
 */
export interface SentimentAnalysis {
  id: string;
  date: string;
  stock_symbol: string;
  sector?: string;
  avg_sentiment: number;
  article_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  created_at: string;
}

/**
 * Données de marché (TradingView)
 */
export interface StockMarketData {
  id: string;
  symbol: string;
  date: string;
  current_price?: number;
  change_percent?: number;
  volume?: number;
  rsi?: number;
  macd?: number;
  moving_avg_20?: number;
  moving_avg_50?: number;
  sector?: string;
  created_at: string;
}

/**
 * Position en portefeuille
 */
export interface PortfolioHolding {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  average_purchase_price: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Capital utilisateur
 */
export interface UserCapital {
  user_id: string;
  total_capital: number;
  currency: string;
  updated_at: string;
}

/**
 * Recommandation d'investissement
 */
export interface Recommendation {
  symbol: string;
  action: RecommendationAction;
  reason: string;
  allocation_percent: number;
  confidence: number;
}

/**
 * Alerte de surveillance
 */
export interface SurveillanceAlert {
  id: string;
  timestamp: string;
  stock_symbol: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  description: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  created_at: string;
}

/**
 * Données pour le graphique de timeline
 */
export interface TimelineDataPoint {
  date: string;
  sentiment: number;
  articles?: number;
}

/**
 * Données pour le heatmap sectoriel
 */
export interface SectorSentiment {
  sector: string;
  sentiment: number;
  article_count: number;
}

/**
 * Distribution de sentiment
 */
export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Paramètres de génération de recommandations
 */
export interface RecommendationParams {
  user_id: string;
  risk_profile: RiskProfile;
  current_capital?: number;
}

/**
 * Réponse du scraping de news
 */
export interface ScrapeNewsResponse {
  success: boolean;
  count: number;
  articles?: Array<{
    title: string;
    url: string;
    stock_symbol?: string;
  }>;
  error?: string;
}

/**
 * Réponse de l'analyse de sentiment
 */
export interface AnalyzeSentimentResponse {
  success: boolean;
  analyzed_count: number;
  aggregations_created: number;
  summary?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  error?: string;
}

/**
 * Réponse de génération de recommandations
 */
export interface GenerateRecommendationsResponse {
  recommendations: Recommendation[];
  error?: string;
}

/**
 * Options pour les hooks de données
 */
export interface DataFetchOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Contexte d'authentification
 */
export interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
