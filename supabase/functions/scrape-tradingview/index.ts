import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

const OVERVIEW_URL =
  "https://www.tradingview.com/markets/stocks-tunisia/market-movers-all-stocks/";
const TECHNICALS_URL =
  "https://www.tradingview.com/markets/stocks-tunisia/market-movers-all-stocks/?column=technical_rating";

// Azure OpenAI Configuration
const AZURE_ENDPOINT = "https://iheccarthage-resource.openai.azure.com/";
const AZURE_DEPLOYMENT = "gpt-5.2-chat";
const AZURE_API_VERSION = "2024-02-15-preview";

async function scrapeMarkdown(
  url: string,
  apiKey: string,
  actions?: Array<Record<string, unknown>>
): Promise<string> {
  console.log(`Scraping markdown from: ${url}`);

  const body: Record<string, unknown> = {
    url,
    formats: ["markdown"],
    waitFor: 8000,
    timeout: 60000,
  };

  if (actions?.length) {
    body.actions = actions;
  }

  const response = await fetch(`${FIRECRAWL_API}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Firecrawl error:", JSON.stringify(data));
    throw new Error(data.error || `Firecrawl failed: ${response.status}`);
  }

  const md = data?.data?.markdown || data?.markdown || "";
  console.log(`Got markdown: ${md.length} chars`);
  return md;
}

async function parseWithAI(
  markdown: string,
  prompt: string,
  azureApiKey: string
): Promise<unknown> {
  console.log("Parsing with Azure OpenAI GPT-5.2...");

  // Construct Azure OpenAI endpoint URL
  const azureUrl = `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

  const response = await fetch(azureUrl, {
    method: "POST",
    headers: {
      "api-key": azureApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are a data extraction assistant. Extract structured JSON from the given data. Return ONLY valid JSON, no markdown fences, no explanations.",
        },
        {
          role: "user",
          content: `${prompt}\n\nHere is the raw data:\n\n${markdown}`,
        },
      ],
      // Note: GPT-5.2 uses temperature=1 by default and max_completion_tokens instead of max_tokens
      max_completion_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Azure OpenAI API error:", errText);
    throw new Error(`Azure OpenAI parse failed: ${response.status}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content || "";
  console.log(`AI response length: ${content.length}`);

  // Try to parse JSON from the response
  try {
    // Remove potential markdown code fences
    const cleaned = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", content.slice(0, 500));
    throw new Error("AI returned invalid JSON");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const firecrawlKey =
      Deno.env.get("FIRECRAWL_API_KEY_1") ||
      Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Azure OpenAI API key
    const azureApiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
    if (!azureApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AZURE_OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache freshness
    const { data: latestScrape } = await supabase
      .from("stock_market_data")
      .select("scraped_at")
      .order("scraped_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestScrape) {
      const elapsed = Date.now() - new Date(latestScrape.scraped_at).getTime();
      if (elapsed < 15 * 60 * 1000) {
        console.log("Cache fresh, skipping scrape");
        return new Response(
          JSON.stringify({ success: true, cached: true, message: "< 15 min" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ====== Phase 1: Scrape Overview ======
    console.log("=== Phase 1: Overview ===");
    const overviewMd = await scrapeMarkdown(OVERVIEW_URL, firecrawlKey);

    const overviewPrompt = `From this TradingView Tunisian stocks page data, extract ALL stocks into a JSON array called "stocks". Each object should have these fields:
- symbol (string, the ticker like AB, AL, ALKIM etc.)
- name (string, company name)
- price (number or null)
- change_percent (number or null, the % change value)
- volume (string or null)
- rel_volume (number or null)
- market_cap (string or null)
- pe_ratio (number or null)
- eps_dil_ttm (number or null)
- eps_dil_growth_ttm_yoy (number or null)
- div_yield_ttm (number or null)
- sector (string or null)
- analyst_rating (string or null, like "Buy", "Strong buy", "Sell" etc.)

Return format: {"stocks": [...]}`;

    const overviewResult = (await parseWithAI(
      overviewMd,
      overviewPrompt,
      azureApiKey
    )) as { stocks: Array<Record<string, unknown>> };
    const overviewStocks = overviewResult?.stocks || [];
    console.log(`Overview parsed: ${overviewStocks.length} stocks`);

    // ====== Phase 2: Scrape Technicals ======
    console.log("=== Phase 2: Technicals ===");
    // Use the technicals-specific URL from TradingView
    const techMd = await scrapeMarkdown(TECHNICALS_URL, firecrawlKey);
    console.log("Technicals markdown sample:", techMd.slice(0, 1000));

    const techPrompt = `From this TradingView Tunisian stocks Technicals tab data, extract ALL stocks into a JSON array called "stocks". Each object should have:
- symbol (string, ticker)
- tech_rating (string or null, like "Buy", "Strong buy", "Sell", "Strong sell", "Neutral")
- ma_rating (string or null)
- os_rating (string or null)
- rsi_14 (number or null)
- momentum_10 (number or null)
- ao (number or null)
- cci_20 (number or null)
- stoch_k (number or null, Stochastic %K)
- stoch_d (number or null, Stochastic %D)
- macd_level (number or null)
- macd_signal (number or null)

Return format: {"stocks": [...]}`;

    const techResult = (await parseWithAI(
      techMd,
      techPrompt,
      azureApiKey
    )) as { stocks: Array<Record<string, unknown>> };
    const techStocks = techResult?.stocks || [];
    console.log(`Technicals parsed: ${techStocks.length} stocks`);

    // ====== Phase 3: Merge and Store ======
    const techMap = new Map<string, Record<string, unknown>>();
    for (const t of techStocks) {
      if (t.symbol) techMap.set(String(t.symbol).toUpperCase(), t);
    }

    const now = new Date().toISOString();
    const rows = overviewStocks
      .filter((s) => s.symbol)
      .map((s) => {
        const sym = String(s.symbol).toUpperCase();
        const tech = techMap.get(sym) || {};
        return {
          symbol: sym,
          name: s.name ? String(s.name) : null,
          price: s.price != null ? Number(s.price) : null,
          change_percent: s.change_percent != null ? Number(s.change_percent) : null,
          volume: s.volume ? String(s.volume) : null,
          rel_volume: s.rel_volume != null ? Number(s.rel_volume) : null,
          market_cap: s.market_cap ? String(s.market_cap) : null,
          pe_ratio: s.pe_ratio != null ? Number(s.pe_ratio) : null,
          eps_dil_ttm: s.eps_dil_ttm != null ? Number(s.eps_dil_ttm) : null,
          eps_dil_growth_ttm_yoy: s.eps_dil_growth_ttm_yoy != null ? Number(s.eps_dil_growth_ttm_yoy) : null,
          div_yield_ttm: s.div_yield_ttm != null ? Number(s.div_yield_ttm) : null,
          sector: s.sector ? String(s.sector) : null,
          analyst_rating: s.analyst_rating ? String(s.analyst_rating) : null,
          rsi_14: tech.rsi_14 != null ? Number(tech.rsi_14) : null,
          tech_rating: tech.tech_rating ? String(tech.tech_rating) : null,
          ma_rating: tech.ma_rating ? String(tech.ma_rating) : null,
          os_rating: tech.os_rating ? String(tech.os_rating) : null,
          momentum_10: tech.momentum_10 != null ? Number(tech.momentum_10) : null,
          ao: tech.ao != null ? Number(tech.ao) : null,
          cci_20: tech.cci_20 != null ? Number(tech.cci_20) : null,
          stoch_k: tech.stoch_k != null ? Number(tech.stoch_k) : null,
          stoch_d: tech.stoch_d != null ? Number(tech.stoch_d) : null,
          macd_level: tech.macd_level != null ? Number(tech.macd_level) : null,
          macd_signal: tech.macd_signal != null ? Number(tech.macd_signal) : null,
          scraped_at: now,
          tab_source: "merged",
        };
      });

    if (rows.length > 0) {
      // Clear old cache
      await supabase
        .from("stock_market_data")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      const { error: insertError } = await supabase
        .from("stock_market_data")
        .insert(rows);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Insert failed: ${insertError.message}`);
      }
      console.log(`Inserted ${rows.length} rows`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        overview_count: overviewStocks.length,
        technical_count: techStocks.length,
        inserted: rows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});