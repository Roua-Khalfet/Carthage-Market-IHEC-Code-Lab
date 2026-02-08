-- Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    published_date TEXT,
    analysis_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Scores Table
CREATE TABLE IF NOT EXISTS scores (
    ticker TEXT PRIMARY KEY,
    score NUMERIC DEFAULT 50.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Score History Table
CREATE TABLE IF NOT EXISTS score_history (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL,
    change NUMERIC NOT NULL,
    reason TEXT,
    article_id INTEGER REFERENCES articles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
