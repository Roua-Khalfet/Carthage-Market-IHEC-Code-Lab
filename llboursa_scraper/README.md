# Tunisian Stock Market News Analysis System

An automated financial news analysis system that scrapes, analyzes, and scores Tunisian stock market news using AI-powered agents and an ELO rating system.

## 🎯 Overview

This system automatically:
- **Discovers** financial news articles from [ilboursa.com](https://www.ilboursa.com)
- **Extracts** article content using browser automation
- **Analyzes** sentiment and market impact using Azure OpenAI (GPT-4.5.2)
- **Scores** stocks using an ELO rating system based on news sentiment
- **Stores** all data in Supabase for reliable persistence and historical tracking

## 🏗️ Architecture

The system consists of several specialized agents:

### Core Agents

- **Discovery Agent** (`discovery_agent.py`): Navigates ilboursa.com to find articles for specific dates
- **Extraction Agent** (`extraction_agent.py`): Extracts full article content from URLs
- **Analysis Agent** (`analysis_agent.py`): Uses Azure OpenAI to analyze sentiment, extract tickers, and assess market impact
- **Stock Manager** (`stock_manager.py`): Manages stock universe and sector mappings
- **Database Manager** (`db_manager.py`): Handles Supabase operations and ELO scoring logic
- **Backfill Manager** (`backfill_manager.py`): Orchestrates historical data processing

## 📊 Features

### Intelligent Sentiment Analysis
- Multi-dimensional sentiment scoring (-5 to +5 scale)
- Ticker-specific and sector-wide impact assessment
- Macroeconomic context interpretation
- Strict validation to avoid false positives

### ELO Rating System
- Dynamic stock scoring based on news sentiment
- Market-relative performance tracking
- Historical score tracking with full audit trail
- K-factor adjustments based on sentiment magnitude

### Data Persistence
- Supabase integration for reliable storage
- Article deduplication by URL
- Score history with timestamps and reasons
- Structured schema for easy querying

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Playwright browser drivers
- Azure OpenAI API access
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   cd webscraper
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers**
   ```bash
   playwright install chromium
   ```

4. **Set up environment variables**
   
   Create a `.env` file with the following:
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_ENDPOINT=your_endpoint_here
   AZURE_DEPLOYMENT_NAME=your_deployment_name
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_API_VERSION=2024-08-01-preview
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   
   # Optional: Anthropic API (for alternative models)
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

5. **Set up Supabase database**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Copy contents of schema.sql to Supabase SQL Editor
   ```

## 📖 Usage

### Check Database Connection

```bash
python check_connection.py
```

### Run Backfill Process

Process historical news articles:

```bash
python backfill_manager.py
```

This will:
1. Prompt for start and end dates
2. Discover articles for each date
3. Extract and analyze content
4. Update stock scores in Supabase
5. Skip already-processed URLs

### Test Individual Components

```bash
# Test Azure OpenAI connection
python test_gpt52_connection.py

# Test API endpoints
python test_api.py

# Run diagnostics
python diagnose.py
```

## 📁 Project Structure

```
webscraper/
├── analysis_agent.py          # AI-powered sentiment analysis
├── backfill_manager.py         # Historical data processing orchestrator
├── browser_config.py           # Playwright browser configuration
├── check_connection.py         # Database connectivity test
├── db_manager.py               # Supabase operations & ELO scoring
├── discovery_agent.py          # News article discovery
├── extraction_agent.py         # Article content extraction
├── stock_manager.py            # Stock universe management
├── schema.sql                  # Database schema
├── requirements.txt            # Python dependencies
├── tunisian_stocks_by_sector.json  # Stock universe data
└── .env                        # Environment configuration
```

## 🗄️ Database Schema

### Tables

**articles**
- Stores scraped articles with content and analysis
- Unique constraint on URL to prevent duplicates
- JSONB field for structured analysis results

**scores**
- Current ELO rating for each stock ticker
- Last updated timestamp
- Default starting rating: 1500

**score_history**
- Complete audit trail of all score changes
- Links to source articles
- Includes reasoning for each change

## 🎲 ELO Scoring System

The system uses a modified ELO rating algorithm:

- **Starting Rating**: 1500 (all stocks)
- **K-Factor**: Dynamic based on sentiment magnitude
  - Base K = 32
  - Adjusted by sentiment strength (1-5 scale)
- **Expected Score**: Based on difference from market average
- **Actual Score**: Derived from sentiment (-5 to +5 → 0 to 1)

### Score Calculation

```python
# Expected probability of "winning" (positive news)
expected = 1 / (1 + 10^((market_avg - current_rating) / 400))

# Actual outcome from sentiment
actual = (sentiment_score + 5) / 10  # Maps -5 to +5 → 0 to 1

# Rating change
delta = K * (actual - expected)
```

## 📈 Stock Universe

The system tracks **80+ Tunisian stocks** across sectors:

- Banks (11 stocks)
- Leasing (6 stocks)
- Insurance (6 stocks)
- Technology & Telecom (9 stocks)
- Industrial & Manufacturing (17 stocks)
- Pharmaceuticals & Healthcare (5 stocks)
- Holding & Investment (15 stocks)
- And more...

See [`tunisian_stocks_by_sector.json`](tunisian_stocks_by_sector.json) for the complete list.

## 🔧 Configuration

### Browser Settings

Modify `browser_config.py` to adjust:
- Headless mode (default: True)
- Browser type (default: Chromium)
- Timeout settings
- User agent

### Analysis Parameters

In `analysis_agent.py`, customize:
- Sentiment scoring thresholds
- Ticker extraction rules
- Sector impact logic
- Temperature settings for AI model

## 🐛 Troubleshooting

### Common Issues

**Browser automation fails**
```bash
# Reinstall Playwright browsers
playwright install --force chromium
```

**Supabase connection errors**
```bash
# Verify credentials
python check_connection.py
```

**Date filtering not working**
- The discovery agent uses specific date format (DD/MM/YYYY)
- Ensure the website structure hasn't changed
- Check browser console for JavaScript errors

**Empty analysis results**
- Verify Azure OpenAI API key and endpoint
- Check API version compatibility
- Review rate limits and quotas

## 📝 Development Notes

### Adding New Stocks

1. Edit `tunisian_stocks_by_sector.json`
2. Add stock to appropriate sector
3. Run backfill to initialize scores

### Customizing Sentiment Analysis

The analysis prompt in `analysis_agent.py` can be modified to:
- Adjust sentiment scale
- Add new analysis dimensions
- Change ticker extraction logic
- Include additional macroeconomic factors

### Switching AI Models

The system supports multiple AI providers:
- **Azure OpenAI** (default): GPT-4.5.2
- **Anthropic**: Claude models (configured but not active)
- Modify `analysis_agent.py` to switch providers

## 📊 Data Flow

```
1. Discovery Agent → Find article URLs for date range
2. Extraction Agent → Scrape full article content
3. Analysis Agent → AI sentiment analysis
4. Database Manager → Calculate ELO changes
5. Supabase → Store articles, scores, history
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Use Supabase RLS policies for production
- Limit browser automation to trusted sources

## 🤝 Contributing

When adding features:
1. Follow existing agent pattern
2. Add appropriate error handling
3. Update this README
4. Test with small date ranges first

## 📄 License

This project is for educational and research purposes.

## 🙏 Acknowledgments

- Data source: [ilboursa.com](https://www.ilboursa.com)
- AI: Azure OpenAI GPT-4.5.2
- Database: Supabase
- Browser automation: Playwright + browser-use

---

**Last Updated**: February 2026
