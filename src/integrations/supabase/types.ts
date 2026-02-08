export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      investor_profiles: {
        Row: {
          completed_at: string
          id: string
          initial_capital: number
          quiz_answers: Json
          quiz_score: number
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          initial_capital?: number
          quiz_answers?: Json
          quiz_score?: number
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          initial_capital?: number
          quiz_answers?: Json
          quiz_score?: number
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sentiment_analyses: {
        Row: {
          affected_sectors: string[] | null
          affected_stocks: string[] | null
          analyzed_at: string
          article_id: number
          article_title: string
          article_url: string | null
          confidence_score: number | null
          created_at: string
          id: string
          published_date: string | null
          recommendation: string | null
          sentiment: string
          sentiment_score: number
          summary: string | null
        }
        Insert: {
          affected_sectors?: string[] | null
          affected_stocks?: string[] | null
          analyzed_at?: string
          article_id: number
          article_title: string
          article_url?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          published_date?: string | null
          recommendation?: string | null
          sentiment: string
          sentiment_score?: number
          summary?: string | null
        }
        Update: {
          affected_sectors?: string[] | null
          affected_stocks?: string[] | null
          analyzed_at?: string
          article_id?: number
          article_title?: string
          article_url?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          published_date?: string | null
          recommendation?: string | null
          sentiment?: string
          sentiment_score?: number
          summary?: string | null
        }
        Relationships: []
      }
      stock_market_data: {
        Row: {
          analyst_rating: string | null
          ao: number | null
          cci_20: number | null
          change_percent: number | null
          div_yield_ttm: number | null
          eps_dil_growth_ttm_yoy: number | null
          eps_dil_ttm: number | null
          id: string
          ma_rating: string | null
          macd_level: number | null
          macd_signal: number | null
          market_cap: string | null
          momentum_10: number | null
          name: string | null
          os_rating: string | null
          pe_ratio: number | null
          price: number | null
          rel_volume: number | null
          rsi_14: number | null
          scraped_at: string
          sector: string | null
          stoch_d: number | null
          stoch_k: number | null
          symbol: string
          tab_source: string | null
          tech_rating: string | null
          volume: string | null
        }
        Insert: {
          analyst_rating?: string | null
          ao?: number | null
          cci_20?: number | null
          change_percent?: number | null
          div_yield_ttm?: number | null
          eps_dil_growth_ttm_yoy?: number | null
          eps_dil_ttm?: number | null
          id?: string
          ma_rating?: string | null
          macd_level?: number | null
          macd_signal?: number | null
          market_cap?: string | null
          momentum_10?: number | null
          name?: string | null
          os_rating?: string | null
          pe_ratio?: number | null
          price?: number | null
          rel_volume?: number | null
          rsi_14?: number | null
          scraped_at?: string
          sector?: string | null
          stoch_d?: number | null
          stoch_k?: number | null
          symbol: string
          tab_source?: string | null
          tech_rating?: string | null
          volume?: string | null
        }
        Update: {
          analyst_rating?: string | null
          ao?: number | null
          cci_20?: number | null
          change_percent?: number | null
          div_yield_ttm?: number | null
          eps_dil_growth_ttm_yoy?: number | null
          eps_dil_ttm?: number | null
          id?: string
          ma_rating?: string | null
          macd_level?: number | null
          macd_signal?: number | null
          market_cap?: string | null
          momentum_10?: number | null
          name?: string | null
          os_rating?: string | null
          pe_ratio?: number | null
          price?: number | null
          rel_volume?: number | null
          rsi_14?: number | null
          scraped_at?: string
          sector?: string | null
          stoch_d?: number | null
          stoch_k?: number | null
          symbol?: string
          tab_source?: string | null
          tech_rating?: string | null
          volume?: string | null
        }
        Relationships: []
      }
      user_portfolio_holdings: {
        Row: {
          created_at: string
          id: string
          purchase_price: number
          quantity: number
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_price?: number
          quantity?: number
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          purchase_price?: number
          quantity?: number
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "investisseur" | "regulateur"
      risk_profile: "conservateur" | "modere" | "agressif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["investisseur", "regulateur"],
      risk_profile: ["conservateur", "modere", "agressif"],
    },
  },
} as const
