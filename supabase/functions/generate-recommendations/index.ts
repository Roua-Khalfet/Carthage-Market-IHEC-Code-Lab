import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Headers CORS pour autoriser les requêtes cross-origin
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Allocation cible par profil de risque
 * Format: { actions: %, obligations: %, liquidite: % }
 */
const ALLOCATION_TARGETS: Record<string, { actions: number; obligations: number; liquidite: number }> = {
  conservateur: { actions: 20, obligations: 40, liquidite: 40 },
  modere: { actions: 40, obligations: 30, liquidite: 30 },
  agressif: { actions: 70, obligations: 20, liquidite: 10 },
};

/**
 * Configuration Azure OpenAI
 */
const AZURE_CONFIG = {
  ENDPOINT: "https://iheccarthage-resource.openai.azure.com/",
  DEPLOYMENT: "gpt-5.2-chat",
  API_VERSION: "2024-02-15-preview",
} as const;

/**
 * Limites de requêtes pour éviter les timeouts
 */
const QUERY_LIMITS = {
  SENTIMENT_DATA: 100,
  MARKET_DATA: 50,
  SENTIMENT_SUMMARY: 30,
  MARKET_SUMMARY: 40,
} as const;

/**
 * Edge Function: Génération de recommandations personnalisées
 * 
 * Entrée:
 * - risk_profile: 'conservateur' | 'modere' | 'agressif'
 * - holdings?: Array<{ symbol: string, quantity: number }>
 * 
 * Sortie:
 * - recommendations: Array<{ symbol, action, reason, allocation_percent, confidence }>
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const azureApiKey = Deno.env.get("AZURE_OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }
    
    if (!azureApiKey) {
      throw new Error("AZURE_OPENAI_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Parser et valider le corps de la requête
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { risk_profile, holdings = [] } = requestBody;

    // 3. Validation stricte des paramètres
    if (!risk_profile || typeof risk_profile !== "string") {
      return new Response(
        JSON.stringify({ error: "risk_profile (string) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validProfiles = ["conservateur", "modere", "agressif"];
    if (!validProfiles.includes(risk_profile)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid risk_profile. Must be one of: ${validProfiles.join(", ")}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(holdings)) {
      return new Response(
        JSON.stringify({ error: "holdings must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-recommendations] Start - Profile: ${risk_profile}, Holdings: ${holdings.length}`);

    const targets = ALLOCATION_TARGETS[risk_profile];

    // 4. Récupérer les données de sentiment
    const { data: sentimentData, error: sentimentError } = await supabase
      .from("sentiment_analyses")
      .select("affected_stocks, sentiment, sentiment_score, recommendation, confidence_score")
      .order("analyzed_at", { ascending: false })
      .limit(QUERY_LIMITS.SENTIMENT_DATA);

    if (sentimentError) {
      console.error("[generate-recommendations] Sentiment fetch error:", sentimentError);
    }

    // 5. Récupérer les données de marché
    const { data: marketData, error: marketError } = await supabase
      .from("stock_market_data")
      .select("symbol, name, price, change_percent, pe_ratio, div_yield_ttm, rsi_14, macd_level, macd_signal, sector")
      .order("symbol")
      .limit(QUERY_LIMITS.MARKET_DATA);

    if (marketError) {
      console.error("[generate-recommendations] Market data fetch error:", marketError);
    }

    // 6. Construire le contexte pour l'IA
    const holdingsStr = (holdings || [])
      .map((h: any) => `${h.symbol}: ${h.quantity} actions`)
      .join(", ") || "Aucune position";

    const sentimentSummary = (sentimentData || [])
      .slice(0, QUERY_LIMITS.SENTIMENT_SUMMARY)
      .map((s: any) => {
        const stocks = (s.affected_stocks || []).join(", ");
        return `[${s.sentiment}/${s.sentiment_score}] ${stocks}: ${s.recommendation || "N/A"}`;
      })
      .join("\n");

    const marketSummary = (marketData || [])
      .slice(0, QUERY_LIMITS.MARKET_SUMMARY)
      .map((m: any) => {
        const rsi = m.rsi_14 !== null ? `RSI:${m.rsi_14}` : "";
        const macd = m.macd_level !== null && m.macd_signal !== null
          ? `MACD:${m.macd_level}/${m.macd_signal}`
          : "";
        return `${m.symbol} (${m.sector || "?"}): ${m.price} TND, Var:${m.change_percent || 0}%, P/E:${m.pe_ratio || "?"}, DivY:${m.div_yield_ttm || 0}% ${rsi} ${macd}`;
      })
      .join("\n");

    const systemPrompt = `Tu es un conseiller financier expert du marché tunisien (BVMT). 
Tu dois fournir des recommandations d'investissement personnalisées.

RÈGLES STRICTES:
1. Profil de risque: ${risk_profile} → Allocation cible: ${targets.actions}% actions, ${targets.obligations}% obligations, ${targets.liquidite}% liquidité
2. DIVERSIFICATION: Ne jamais recommander plus de 15% du portefeuille dans une seule action
3. Générer entre 5 et 10 recommandations (ACHETER, VENDRE, ou CONSERVER)
4. Baser tes recommandations sur les données de sentiment ET les indicateurs techniques
5. RSI > 70 = surachat (attention), RSI < 30 = survente (opportunité)
6. MACD > Signal = tendance haussière, MACD < Signal = tendance baissière
7. Favoriser les actions avec un bon dividende pour le profil conservateur
8. Pour le profil agressif, accepter plus de volatilité mais diversifier quand même

Tu DOIS retourner les recommandations via l'outil suggest_portfolio.`;

    const userPrompt = `Positions actuelles: ${holdingsStr}

DONNÉES DE SENTIMENT RÉCENTES:
${sentimentSummary || "Pas de données de sentiment disponibles"}

DONNÉES DE MARCHÉ:
${marketSummary || "Pas de données de marché disponibles"}

Génère tes recommandations personnalisées en respectant le profil ${risk_profile} et les règles de diversification.`;

    console.log(`[generate-recommendations] Calling Azure OpenAI GPT-5.2...`);

    // 7. Construire l'URL Azure OpenAI
    const azureUrl = `${AZURE_CONFIG.ENDPOINT}openai/deployments/${AZURE_CONFIG.DEPLOYMENT}/chat/completions?api-version=${AZURE_CONFIG.API_VERSION}`;

    // 8. Appeler Azure OpenAI avec Function Calling
    const aiResponse = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "api-key": azureApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_portfolio",
              description: "Return 5-10 personalized stock recommendations for the Tunisian market.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        symbol: { type: "string", description: "Stock ticker symbol" },
                        action: { type: "string", enum: ["ACHETER", "VENDRE", "CONSERVER"] },
                        reason: { type: "string", description: "Brief justification in French" },
                        allocation_percent: { type: "number", description: "Suggested portfolio percentage 0-15" },
                        confidence: { type: "number", description: "Confidence score 0-100" },
                      },
                      required: ["symbol", "action", "reason", "allocation_percent", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_portfolio" } },
        max_completion_tokens: 4000,
      }),
    });

    // 9. Vérifier la réponse Azure OpenAI
    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error(`[generate-recommendations] Azure OpenAI error ${status}:`, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Azure OpenAI returned ${status}: ${text.substring(0, 200)}`);
    }

    const aiData = await aiResponse.json();
    console.log("[generate-recommendations] Azure OpenAI response received");

    // 10. Extraire le résultat du Function Calling
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error("[generate-recommendations] No tool call in response:", JSON.stringify(aiData, null, 2));
      throw new Error("AI did not return structured recommendations. Check system prompt and tools configuration.");
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("[generate-recommendations] Failed to parse tool arguments:", toolCall.function.arguments);
      throw new Error("Invalid JSON in AI tool call response");
    }

    const recommendations = parsed.recommendations || [];
    
    console.log(`[generate-recommendations] Success - ${recommendations.length} recommendations generated`);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-recommendations] Fatal error:", errorMessage);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
