
-- Add unique constraint on article_id for upsert support
ALTER TABLE public.sentiment_analyses ADD CONSTRAINT sentiment_analyses_article_id_unique UNIQUE (article_id);
