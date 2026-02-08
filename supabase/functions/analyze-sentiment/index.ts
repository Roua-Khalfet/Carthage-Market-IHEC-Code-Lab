import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOCKS_BY_SECTOR: Record<string, { name: string; ticker: string }[]> = {
  banks: [
    { name: "AMEN BANK", ticker: "AMEN BANK" },
    { name: "ARAB TUNISIAN BANK", ticker: "ARAB TUNISIAN BANK" },
    { name: "ATTIJARI BANK", ticker: "ATTIJARI BANK" },
    { name: "BANQUE DE TUNISIE", ticker: "BANQUE DE TUNISIE" },
    { name: "BANQUE NATIONALE AGRICOLE", ticker: "BANQUE NATIONALE AGRICOLE" },
    { name: "BH BANK", ticker: "BH BANK" },
    { name: "BIAT", ticker: "BIAT" },
    { name: "STB BANK", ticker: "STB BANK" },
    { name: "UBCI", ticker: "UBCI" },
    { name: "UIB", ticker: "UIB" },
    { name: "WIFAK INT BANK", ticker: "WIFAK INT BANK" },
  ],
  leasing: [
    { name: "ARAB TUNISIAN LEASE", ticker: "ARAB TUNISIAN LEASE" },
    { name: "ATTIJARI LEASING", ticker: "ATTIJARI LEASING" },
    { name: "BEST LEASE", ticker: "BEST LEASE" },
    { name: "BH LEASING", ticker: "BH LEASING" },
    { name: "HANNIBAL LEASE", ticker: "HANNIBAL LEASE" },
    { name: "TUNISIE LEASING & FACTORING", ticker: "TUNISIE LEASING & FACTORING" },
  ],
  insurance: [
    { name: "ASSURANCES MAGHREBIA", ticker: "ASSURANCES MAGHREBIA" },
    { name: "ASTREE", ticker: "ASTREE" },
    { name: "BH ASSURANCE", ticker: "BH ASSURANCE" },
    { name: "BNA ASSURANCES", ticker: "BNA ASSURANCES" },
    { name: "MAGHREBIA VIE", ticker: "MAGHREBIA VIE" },
    { name: "TUNIS RE", ticker: "TUNIS RE" },
  ],
  automotive: [
    { name: "CITY CARS", ticker: "CITY CARS" },
    { name: "ENNAKL AUTOMOBILES", ticker: "ENNAKL AUTOMOBILES" },
    { name: "EURO-CYCLES", ticker: "EURO-CYCLES" },
  ],
  food_and_beverage: [
    { name: "CEREALIS", ticker: "CEREALIS" },
    { name: "DELICE HOLDING", ticker: "DELICE HOLDING" },
    { name: "LAND'OR", ticker: "LAND'OR" },
    { name: "SFBT", ticker: "SFBT" },
  ],
  retail_and_distribution: [
    { name: "MAGASIN GENERAL", ticker: "MAGASIN GENERAL" },
    { name: "MONOPRIX", ticker: "MONOPRIX" },
  ],
  building_materials: [
    { name: "CARTHAGE CEMENT", ticker: "CARTHAGE CEMENT" },
    { name: "CIMENTS DE BIZERTE", ticker: "CIMENTS DE BIZERTE" },
    { name: "MEUBLES INTERIEURS", ticker: "MEUBLES INTERIEURS" },
    { name: "OFFICE PLAST", ticker: "OFFICE PLAST" },
    { name: "SOMOCER", ticker: "SOMOCER" },
  ],
  chemicals_and_materials: [
    { name: "AIR LIQUIDE TUNISIE", ticker: "AIR LIQUIDE TUNISIE" },
    { name: "SOCIETE CHIMIQUE ALKIMIA", ticker: "SOCIETE CHIMIQUE ALKIMIA" },
    { name: "SOTRAPIL", ticker: "SOTRAPIL" },
  ],
  technology_and_telecom: [
    { name: "AETECH", ticker: "AETECH" },
    { name: "CELLCOM", ticker: "CELLCOM" },
    { name: "HEXABYTE", ticker: "HEXABYTE" },
    { name: "ONE TECH", ticker: "ONE TECH" },
    { name: "SERVICOM", ticker: "SERVICOM" },
    { name: "SMART TUNISIE", ticker: "SMART TUNISIE" },
    { name: "SOTETEL", ticker: "SOTETEL" },
    { name: "TAWASOL", ticker: "TAWASOL" },
    { name: "TELNET HOLDING", ticker: "TELNET HOLDING" },
  ],
  industrial_and_manufacturing: [
    { name: "ADWYA", ticker: "ADWYA" },
    { name: "AMS", ticker: "AMS" },
    { name: "ARTES", ticker: "ARTES" },
    { name: "CIL", ticker: "CIL" },
    { name: "ELECTROSTAR", ticker: "ELECTROSTAR" },
    { name: "GIF FILTER", ticker: "GIF FILTER" },
    { name: "ICF", ticker: "ICF" },
    { name: "MIP", ticker: "MIP" },
    { name: "MPBS", ticker: "MPBS" },
    { name: "SAH", ticker: "SAH" },
    { name: "SITS", ticker: "SITS" },
    { name: "SOPAT", ticker: "SOPAT" },
    { name: "SOTEMAIL", ticker: "SOTEMAIL" },
    { name: "SOTIPAPIER", ticker: "SOTIPAPIER" },
    { name: "SOTUMAG", ticker: "SOTUMAG" },
    { name: "SOTUVER", ticker: "SOTUVER" },
    { name: "STA", ticker: "STA" },
  ],
  pharmaceuticals_and_healthcare: [
    { name: "ELBENE", ticker: "ELBENE" },
    { name: "NEW BODY LINE", ticker: "NEW BODY LINE" },
    { name: "SANIMED", ticker: "SANIMED" },
    { name: "SIPHAT", ticker: "SIPHAT" },
    { name: "UNIMED", ticker: "UNIMED" },
  ],
  holding_and_investment: [
    { name: "ASSAD", ticker: "ASSAD" },
    { name: "BTE (ADP)", ticker: "BTE (ADP)" },
    { name: "ESSOUKNA", ticker: "ESSOUKNA" },
    { name: "PLACEMENTS DE TUNISIE - SICAF", ticker: "PLACEMENTS DE TUNISIE - SICAF" },
    { name: "POULINA GROUP HOLDING", ticker: "POULINA GROUP HOLDING" },
    { name: "SIAME", ticker: "SIAME" },
    { name: "SIMPAR", ticker: "SIMPAR" },
    { name: "SPDIT - SICAF", ticker: "SPDIT - SICAF" },
    { name: "STAR", ticker: "STAR" },
    { name: "STEQ", ticker: "STEQ" },
    { name: "STIP", ticker: "STIP" },
    { name: "TPR", ticker: "TPR" },
    { name: "TUNINVEST - SICAR", ticker: "TUNINVEST - SICAR" },
    { name: "TUNISIE VALEURS", ticker: "TUNISIE VALEURS" },
    { name: "UADH", ticker: "UADH" },
  ],
  transport_and_aviation: [
    { name: "SYPHAX AIRLINES", ticker: "SYPHAX AIRLINES" },
    { name: "TUNISAIR", ticker: "TUNISAIR" },
  ],
};

const ALL_STOCKS = Object.entries(STOCKS_BY_SECTOR).flatMap(([sector, stocks]) =>
  stocks.map((s) => ({ ...s, sector }))
);

const STOCK_NAMES = ALL_STOCKS.map((s) => s.name);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 10, offset = 0 } = await req.json().catch(() => ({}));

    const EXTERNAL_SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_SUPABASE_KEY = Deno.env.get("EXTERNAL_SUPABASE_KEY");
    const AZURE_OPENAI_ENDPOINT = Deno.env.get("AZURE_OPENAI_ENDPOINT") || "https://iheccarthage-resource.openai.azure.com/";
    const AZURE_OPENAI_KEY = Deno.env.get("AZURE_OPENAI_KEY");
    const AZURE_OPENAI_DEPLOYMENT = Deno.env.get("AZURE_OPENAI_DEPLOYMENT") || "gpt-5.2-chat";
    const AZURE_API_VERSION = Deno.env.get("AZURE_API_VERSION") || "2024-02-15-preview";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_KEY) {
      throw new Error("External database credentials not configured");
    }
    if (!AZURE_OPENAI_KEY) {
      throw new Error("AZURE_OPENAI_KEY not configured");
    }

    // Connect to external Supabase for articles
    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);
    
    // Connect to own Supabase for storing results
    const ownSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch articles from external source
    const { data: articles, error: fetchError } = await externalSupabase
      .from("tunisian_news")
      .select("*")
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Error fetching articles:", fetchError);
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, analyzed: 0, message: "No articles to analyze" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetched ${articles.length} articles to analyze`);

    // Check which articles are already analyzed
    const articleIds = articles.map((a: any) => a.id);
    const { data: existing } = await ownSupabase
      .from("sentiment_analyses")
      .select("article_id")
      .in("article_id", articleIds);

    const existingIds = new Set((existing || []).map((e: any) => e.article_id));
    const newArticles = articles.filter((a: any) => !existingIds.has(a.id));

    if (newArticles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, analyzed: 0, message: "All articles already analyzed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${newArticles.length} new articles to analyze`);

    const results = [];

    // Analyze in batches of 5
    for (let i = 0; i < newArticles.length; i += 5) {
      const batch = newArticles.slice(i, i + 5);
      
      const articleTexts = batch
        .map((a: any, idx: number) => `[Article ${idx + 1}] Titre: ${a.title}\nContenu: ${a.content || "N/A"}\nURL: ${a.source_url || "N/A"}\nDate: ${a.date || "N/A"}`)
        .join("\n\n");

      const stocksList = STOCK_NAMES.join(", ");

      const prompt = `Tu es un analyste financier expert du marché boursier tunisien (BVMT). Analyse les articles financiers suivants et pour CHAQUE article, détermine:

1. Le sentiment global (positive, negative, ou neutral)
2. Un score de sentiment entre -1.0 (très négatif) et 1.0 (très positif)
3. Un résumé court (1-2 phrases)
4. Les valeurs cotées BVMT potentiellement impactées (parmi: ${stocksList})
5. Les secteurs impactés (parmi: banks, leasing, insurance, automotive, food_and_beverage, retail_and_distribution, building_materials, chemicals_and_materials, technology_and_telecom, industrial_and_manufacturing, pharmaceuticals_and_healthcare, holding_and_investment, transport_and_aviation)
6. Une recommandation (ACHETER, VENDRE, ou CONSERVER) avec un score de confiance entre 0 et 1

Articles à analyser:
${articleTexts}`;

      try {
        // Azure OpenAI API endpoint
        const azureUrl = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

        const aiResponse = await fetch(azureUrl, {
          method: "POST",
          headers: {
            "api-key": AZURE_OPENAI_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `Tu es un analyste financier expert. Réponds UNIQUEMENT en JSON valide. Gère le français et l'arabe. Ne génère aucun texte en dehors du JSON.`,
              },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "analyze_articles",
                  description: "Analyse le sentiment des articles financiers tunisiens",
                  parameters: {
                    type: "object",
                    properties: {
                      analyses: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            article_index: { type: "number", description: "Index de l'article (1-based)" },
                            sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                            sentiment_score: { type: "number", description: "Score entre -1.0 et 1.0" },
                            summary: { type: "string", description: "Résumé court de l'article" },
                            affected_stocks: { type: "array", items: { type: "string" }, description: "Tickers BVMT impactés" },
                            affected_sectors: { type: "array", items: { type: "string" }, description: "Secteurs impactés" },
                            recommendation: { type: "string", enum: ["ACHETER", "VENDRE", "CONSERVER"] },
                            confidence_score: { type: "number", description: "Score de confiance 0-1" },
                          },
                          required: ["article_index", "sentiment", "sentiment_score", "summary", "affected_stocks", "affected_sectors", "recommendation", "confidence_score"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["analyses"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "analyze_articles" } },
            // Note: GPT-5.2 uses temperature=1 by default and doesn't accept other values
            // max_completion_tokens is used instead of max_tokens for GPT-5.2
            max_completion_tokens: 4000,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("Azure OpenAI error:", aiResponse.status, errorText);
          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (aiResponse.status === 401) {
            return new Response(
              JSON.stringify({ error: "Authentication failed, check your API key" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          continue;
        }

        const aiData = await aiResponse.json();
        console.log("Azure OpenAI response received for batch", i / 5 + 1);

        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) {
          console.error("No tool call in Azure OpenAI response");
          continue;
        }

        const analyses = JSON.parse(toolCall.function.arguments).analyses;

        for (const analysis of analyses) {
          const articleIdx = analysis.article_index - 1;
          if (articleIdx < 0 || articleIdx >= batch.length) continue;

          const article = batch[articleIdx];
          const record = {
            article_id: article.id,
            article_title: article.title,
            article_url: article.source_url || null,
            published_date: article.date || null,
            sentiment: analysis.sentiment,
            sentiment_score: Math.max(-1, Math.min(1, analysis.sentiment_score)),
            summary: analysis.summary,
            affected_stocks: analysis.affected_stocks || [],
            affected_sectors: analysis.affected_sectors || [],
            recommendation: analysis.recommendation,
            confidence_score: Math.max(0, Math.min(1, analysis.confidence_score)),
          };

          results.push(record);
        }
      } catch (batchError) {
        console.error("Error analyzing batch:", batchError);
        continue;
      }
    }

    // Insert results
    if (results.length > 0) {
      const { error: insertError } = await ownSupabase
        .from("sentiment_analyses")
        .upsert(results, { onConflict: "article_id" });

      if (insertError) {
        console.error("Error inserting results:", insertError);
        throw new Error(`Failed to store results: ${insertError.message}`);
      }
      console.log(`Successfully stored ${results.length} sentiment analyses`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analyzed: results.length,
        total_fetched: articles.length,
        new_articles: newArticles.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-sentiment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});