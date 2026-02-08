
-- Table to cache TradingView stock market data
CREATE TABLE public.stock_market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT,
  price NUMERIC,
  change_percent NUMERIC,
  volume TEXT,
  rel_volume NUMERIC,
  market_cap TEXT,
  pe_ratio NUMERIC,
  eps_dil_ttm NUMERIC,
  eps_dil_growth_ttm_yoy NUMERIC,
  div_yield_ttm NUMERIC,
  sector TEXT,
  analyst_rating TEXT,
  -- Technical indicators
  rsi_14 NUMERIC,
  tech_rating TEXT,
  ma_rating TEXT,
  os_rating TEXT,
  momentum_10 NUMERIC,
  ao NUMERIC,
  cci_20 NUMERIC,
  stoch_k NUMERIC,
  stoch_d NUMERIC,
  macd_level NUMERIC,
  macd_signal NUMERIC,
  -- Cache metadata
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tab_source TEXT DEFAULT 'overview'
);

-- Index for fast lookups
CREATE INDEX idx_stock_market_data_symbol ON public.stock_market_data (symbol);
CREATE INDEX idx_stock_market_data_scraped_at ON public.stock_market_data (scraped_at DESC);

-- Enable RLS
ALTER TABLE public.stock_market_data ENABLE ROW LEVEL SECURITY;

-- Public read access (market data is not sensitive)
CREATE POLICY "Anyone can read stock market data"
  ON public.stock_market_data
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via edge function)
CREATE POLICY "Service role can manage stock market data"
  ON public.stock_market_data
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
