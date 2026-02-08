import os
import json
from openai import AzureOpenAI
from dotenv import load_dotenv
from stock_manager import StockManager

load_dotenv()

def analyze_article(text: str):
    """
    Analyzes the financial article text using Azure OpenAI.
    Extracts Sentiment, Summary, and Tickers.
    Enhanced with macroeconomic interpretation.
    """
    
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_DEPLOYMENT_NAME")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")

    if not endpoint or not api_key or not deployment:
        raise ValueError("Azure OpenAI credentials missing in .env")

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=api_key,
    )

    # Load Stock Manager to get context for the LLM
    sm = StockManager()
    
    # Build comprehensive context with actual company names
    sector_context = []
    for sector_key, stocks in sm.stocks_data.items():
        sector_name = sector_key.replace("_", " ").title()
        company_names = [s['name'] for s in stocks]
        sector_context.append(f"- **{sector_name}** (use '{sector_key}' as target): {', '.join(company_names)}")
    
    context_text = "\n".join(sector_context)
    
    prompt = f"""
You are an elite financial analyst for the Tunisian Stock Market with deep expertise in macroeconomic analysis and market psychology.

**TUNISIAN STOCK UNIVERSE:**
{context_text}

**YOUR MISSION:**
Analyze the following article and determine its impact on Tunisian stocks. You must think beyond explicit mentions and consider indirect economic effects.

═══════════════════════════════════════════════════════════════

**SECTION 1: DETECTION RULES**

**1A. EXPLICIT MENTIONS (Easy)**
- Company names mentioned directly → Impact that specific ticker
- Sector terms (e.g., "banking sector", "insurance companies") → Impact entire sector
- Examples:
  * "BIAT announces profits" → BIAT ticker
  * "Banks face liquidity issues" → banks sector
  * "Leasing sector grows 10%" → leasing sector

**1B. MACROECONOMIC/INDIRECT IMPACTS (Think Deeper!)**
Even if NO companies are mentioned by name, these situations impact stocks:

📊 **Investment Climate & Rankings:**
- "Tunisia improves investment ranking/attractiveness"
  → ✅ Positive for: banks (+2), holding_and_investment (+2), insurance (+1)
  → Why? More foreign capital → more banking activity, more investments, more insurance
  
- "Tunisia's credit rating downgraded"
  → ❌ Negative for: banks (-3), holding_and_investment (-3), all sectors (-1)
  → Why? Capital flight, reduced investment, economic pessimism

- "Foreign direct investment increases/decreases"
  → Same logic as above

🏛️ **Government Policy:**
- "New subsidies for agriculture"
  → ✅ food_and_beverage (+2)
  
- "Tax breaks for tech sector"
  → ✅ technology_and_telecom (+2)
  
- "Restrictions on imports"
  → Depends on sector (e.g., ❌ automotive -2 if they import cars)

💰 **Currency & Inflation:**
- "Dinar strengthens"
  → ❌ Exporters hurt: industrial_and_manufacturing (-1), food_and_beverage (-1)
  → ✅ Importers benefit: automotive (+1), retail_and_distribution (+1)
  
- "High inflation announced"
  → ✅ Real assets: building_materials (+1)
  → ❌ Consumer discretionary: retail_and_distribution (-1)

⚡ **Energy Prices:**
- "Oil prices surge"
  → ❌ transport_and_aviation (-3), chemicals_and_materials (-2)
  → ✅ None (Tunisia imports oil)

🌍 **Regional/Global Events:**
- "European recession fears"
  → ❌ All export-heavy sectors: industrial_and_manufacturing (-2), food_and_beverage (-1)
  → Why? Tunisia exports to Europe
  
- "Tourism surge expected"
  → ✅ retail_and_distribution (+2), food_and_beverage (+1)

═══════════════════════════════════════════════════════════════

**SECTION 2: SCORING PHILOSOPHY**

**The -5 to +5 Scale Explained:**

Think of this as **ALPHA** - how much better/worse will this stock perform vs. the market:

• **-5**: CATASTROPHIC
  - Company bankruptcy, massive fraud, total sector collapse
  - Example: "Bank loses banking license", "Factory explodes"

• **-4 to -3**: VERY NEGATIVE
  - Major scandal, earnings miss >30%, regulatory crackdown
  - Example: "CEO arrested for fraud", "Profits drop 40%"

• **-2**: CLEARLY NEGATIVE
  - Earnings miss 10-20%, bad quarterly results, lawsuit filed
  - Example: "Revenue declines 15%", "Loses major contract"

• **-1**: SLIGHTLY NEGATIVE
  - Minor bad news, uncertainty, warning signs
  - Example: "CFO resigns", "Market share slips slightly"

• **0**: TRULY NEUTRAL
  - ONLY use if article is 100% irrelevant to Tunisian stocks
  - Example: "New traffic lights installed in Tunis" (unless it's a construction company!)
  - ⚠️ **When in doubt, don't use 0** - most news has SOME impact

• **+1**: SLIGHTLY POSITIVE
  - Minor good news, stability signals, meeting expectations
  - Example: "Confirms dividend", "CEO reaffirms guidance"

• **+2**: CLEARLY POSITIVE
  - Good earnings, new partnership, expansion announced
  - Example: "Profits up 15%", "Signs major deal"

• **+3 to +4**: VERY POSITIVE
  - Major breakthrough, exceptional earnings, transformative deal
  - Example: "Profits double", "Wins government mega-contract"

• **+5**: EXTRAORDINARY
  - Complete game-changer for the company/sector
  - Example: "Discovers oil reserves", "Gets exclusive national license"

**IMPORTANT SCORING PRINCIPLES:**
1. **Magnitude matters**: "Profits up 50%" is +4, "Profits up 3%" is +1
2. **Certainty matters**: "Plans to expand" is +1, "Expansion completed" is +2
3. **Time matters**: "Long-term strategy" is +1, "Immediate impact" is +2
4. **Scope matters**: Affects one company vs. entire sector
5. **Be bold**: Don't cluster everything at -1, 0, +1. Use the full scale!

═══════════════════════════════════════════════════════════════

**SECTION 3: REASONING QUALITY**

Your reasoning MUST explain:
1. **WHAT** in the article triggered the impact
2. **WHY** it affects this ticker/sector
3. **HOW MUCH** and why that magnitude

**❌ BAD reasoning:**
- "Positive news for banks" (too vague)
- "Good for the sector" (doesn't explain why)
- "Article mentions BIAT" (obvious, no insight)

**✅ GOOD reasoning:**
- "Tunisia's improved investment ranking (+4 places) signals better foreign capital inflows, directly benefiting banks through increased deposits and lending opportunities. Moderate impact as it's a ranking improvement, not actual capital flows yet."
- "Banking sector liquidity crisis reported with NPL ratio at 15% (critical threshold). Major concern for all banks' profitability and lending capacity in coming quarters."

═══════════════════════════════════════════════════════════════

**ARTICLE TO ANALYZE:**
{text}

═══════════════════════════════════════════════════════════════

**YOUR TASK:**
1. Read carefully - don't just skim for company names
2. Think macroeconomically - consider indirect effects
3. Be specific - identify ALL affected tickers/sectors
4. Score boldly - use the full -5 to +5 range appropriately
5. Explain clearly - your reasoning should teach someone about the impact

**OUTPUT FORMAT (JSON only, no markdown):**
{{
    "impacts": [
        {{
            "target": "exact_sector_key_or_ticker_name",
            "type": "ticker" or "sector",
            "sentiment_score": integer_between_-5_and_5,
            "reasoning": "Detailed explanation following Section 3 guidelines"
        }}
    ]
}}

**REMINDERS:**
- For sectors: Use EXACT keys like "banks", "food_and_beverage", "technology_and_telecom"
- For tickers: Use EXACT names like "BIAT", "AMEN BANK"
- Multiple impacts are expected for most articles (companies AND sectors)
- Empty impacts [] should be RARE - most news affects someone
- DO NOT wrap in markdown code blocks
- Think like a professional analyst, not a keyword matcher

Now analyze the article above.
"""

    messages = [
        {"role": "system", "content": "You are an elite financial analyst with expertise in both direct company analysis and macroeconomic factors. You excel at finding hidden implications in news that affect stock performance. Output valid JSON only. Never use markdown code blocks."},
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_DEPLOYMENT_NAME"),
            messages=messages,
            # temperature=1 (default for this model - custom values not supported)
            max_completion_tokens=1500  # Increased for detailed reasoning
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"impacts": [], "error": str(e)})