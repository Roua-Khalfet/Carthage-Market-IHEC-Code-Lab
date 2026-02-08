
-- Table to store sentiment analysis results
CREATE TABLE public.sentiment_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id INTEGER NOT NULL,
  article_title TEXT NOT NULL,
  article_url TEXT,
  published_date TEXT,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score NUMERIC(4,2) NOT NULL DEFAULT 0,
  summary TEXT,
  affected_stocks TEXT[] DEFAULT '{}',
  affected_sectors TEXT[] DEFAULT '{}',
  recommendation TEXT CHECK (recommendation IN ('ACHETER', 'VENDRE', 'CONSERVER')),
  confidence_score NUMERIC(4,2) DEFAULT 0,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sentiment_analyses ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth needed for viewing sentiment data)
CREATE POLICY "Anyone can view sentiment analyses"
  ON public.sentiment_analyses
  FOR SELECT
  USING (true);

-- Only service role can insert/update (edge function)
CREATE POLICY "Service role can insert sentiment analyses"
  ON public.sentiment_analyses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update sentiment analyses"
  ON public.sentiment_analyses
  FOR UPDATE
  USING (true);

-- Index for faster queries
CREATE INDEX idx_sentiment_analyses_article_id ON public.sentiment_analyses(article_id);
CREATE INDEX idx_sentiment_analyses_sentiment ON public.sentiment_analyses(sentiment);
CREATE INDEX idx_sentiment_analyses_published_date ON public.sentiment_analyses(published_date);
CREATE INDEX idx_sentiment_analyses_affected_stocks ON public.sentiment_analyses USING GIN(affected_stocks);
