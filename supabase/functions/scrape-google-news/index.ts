import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All Tunisian stocks by sector
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

// Delay helper to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sector,           // Optional: filter by sector
      stockNames,       // Optional: specific stock names array
      articlesPerStock = 5,
      timePeriod = "qdr:m" // Default: last month. Options: qdr:d (day), qdr:w (week), qdr:m (month), qdr:y (year)
    } = await req.json().catch(() => ({}));

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const EXTERNAL_SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_SUPABASE_KEY = Deno.env.get("EXTERNAL_SUPABASE_KEY");

    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY not configured. Please connect Firecrawl in Settings.");
    }
    if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_KEY) {
      throw new Error("External database credentials not configured");
    }

    // Determine which stocks to process
    let stocksToProcess: { name: string; ticker: string; sector: string }[];
    
    if (stockNames && Array.isArray(stockNames)) {
      stocksToProcess = stockNames.map((name: string) => {
        const found = ALL_STOCKS.find((s) => s.name === name);
        return found || { name, ticker: name, sector: "unknown" };
      });
    } else if (sector) {
      stocksToProcess = ALL_STOCKS.filter((s) => s.sector === sector);
    } else {
      stocksToProcess = ALL_STOCKS;
    }

    console.log(`Processing ${stocksToProcess.length} stocks, ${articlesPerStock} articles each`);

    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);
    
    const allArticles: any[] = [];
    const errors: string[] = [];

    // Process each stock
    for (let i = 0; i < stocksToProcess.length; i++) {
      const stock = stocksToProcess[i];
      console.log(`[${i + 1}/${stocksToProcess.length}] Searching Google News for: ${stock.name}`);

      try {
        // Use Firecrawl search with Google News-oriented query
        const searchQuery = `"${stock.name}" bourse Tunisie actualité`;
        
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: articlesPerStock,
            lang: "fr",
            country: "tn",
            tbs: timePeriod,
            scrapeOptions: {
              formats: ["markdown"],
            },
          }),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`Firecrawl search error for ${stock.name}:`, searchResponse.status, errorText);
          
          if (searchResponse.status === 429) {
            console.log("Rate limited, waiting 10 seconds...");
            await delay(10000);
            // Retry once
            const retryResponse = await fetch("https://api.firecrawl.dev/v1/search", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: searchQuery,
                limit: articlesPerStock,
                lang: "fr",
                country: "tn",
                tbs: timePeriod,
              }),
            });
            
            if (!retryResponse.ok) {
              errors.push(`${stock.name}: Rate limited after retry`);
              continue;
            }
            
            const retryData = await retryResponse.json();
            const retryResults = retryData.data || [];
            
            for (const result of retryResults) {
              allArticles.push({
                title: result.title || `Article sur ${stock.name}`,
                content: result.markdown || result.description || null,
                date: new Date().toISOString().split("T")[0],
                source_url: result.url || null,
                source: "google_news",
                stock_name: stock.name,
                sector: stock.sector,
              });
            }
            continue;
          }
          
          errors.push(`${stock.name}: ${searchResponse.status}`);
          continue;
        }

        const searchData = await searchResponse.json();
        const results = searchData.data || [];
        
        console.log(`  Found ${results.length} articles for ${stock.name}`);

        for (const result of results) {
          allArticles.push({
            title: result.title || `Article sur ${stock.name}`,
            content: result.markdown || result.description || null,
            date: new Date().toISOString().split("T")[0],
            source_url: result.url || null,
            source: "google_news",
            stock_name: stock.name,
            sector: stock.sector,
          });
        }

        // Small delay between requests to avoid rate limiting (300ms)
        if (i < stocksToProcess.length - 1) {
          await delay(300);
        }
      } catch (stockError) {
        console.error(`Error processing ${stock.name}:`, stockError);
        errors.push(`${stock.name}: ${stockError instanceof Error ? stockError.message : "Unknown error"}`);
        continue;
      }
    }

    console.log(`Total articles scraped: ${allArticles.length}`);

    // Insert articles into external Supabase tunisian_news table
    let insertedCount = 0;
    if (allArticles.length > 0) {
      // Insert in batches of 50
      for (let i = 0; i < allArticles.length; i += 50) {
        const batch = allArticles.slice(i, i + 50).map((a) => ({
          title: a.title,
          content: a.content,
          date: a.date,
          source_url: a.source_url,
        }));

        const { data: inserted, error: insertError } = await externalSupabase
          .from("tunisian_news")
          .insert(batch)
          .select("id");

        if (insertError) {
          console.error(`Error inserting batch ${i / 50 + 1}:`, insertError);
          errors.push(`Insert batch error: ${insertError.message}`);
        } else {
          insertedCount += (inserted || []).length;
        }
      }
      console.log(`Inserted ${insertedCount} articles into tunisian_news`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stocks_processed: stocksToProcess.length,
        articles_scraped: allArticles.length,
        articles_inserted: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-google-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
