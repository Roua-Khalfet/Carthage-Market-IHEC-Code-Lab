# Tunisian News Scraper

A Python script that scrapes financial news from the BVMT (Bourse des Valeurs Mobilières de Tunis) website and stores the data in Supabase.

## Features

- Scrapes news articles from https://www.bvmt.com.tn
- Extracts article titles, content, and dates
- Stores data in Supabase database
- Batch processing for efficient API usage
- Automatic retry for failed pages
- Alternative option to save to local JSON file

## Prerequisites

- Python 3.8 or higher
- Anthropic API key (for Claude AI)
- Firecrawl API key (for web scraping)
- Supabase account and credentials

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your actual API keys and credentials

## Configuration

Edit the `.env` file with your credentials:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
FIRECRAWL_API_KEY=fc-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

## Database Setup

Create a table in your Supabase database:

```sql
CREATE TABLE tunisian_news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    page_number INTEGER,
    source_url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add indexes for better query performance
CREATE INDEX idx_tunisian_news_date ON tunisian_news(date);
CREATE INDEX idx_tunisian_news_scraped_at ON tunisian_news(scraped_at);
```

## Usage

### Basic Usage (Save to Supabase)

```bash
python tunisian_news_scraper.py
```

This will scrape pages 0-20 and save all articles to your Supabase database.

### Alternative Usage (Save to Local File)

Modify the `main()` function in the script:

```python
# Comment out this line:
# scraper.scrape_all(start_page=0, end_page=20)

# Uncomment this line:
scraper.save_to_file("tunisian_news.json")
```

### Customization

You can customize the scraping behavior by modifying these parameters in the `main()` function:

```python
# Scrape specific page range
scraper.scrape_all(start_page=0, end_page=50)

# Change batch size (in the class initialization)
BATCH_SIZE = 10
```

## Output

### Supabase Output
Articles are stored in the `tunisian_news` table with the following fields:
- `title`: Article title
- `content`: Article content/summary
- `date`: Publication date (DD/MM/YYYY format)
- `page_number`: Source page number
- `source_url`: URL of the scraped page
- `scraped_at`: Timestamp of when the article was scraped

### JSON File Output
When using the `save_to_file()` method, articles are saved in JSON format:

```json
[
  {
    "title": "Article Title",
    "content": "Article content...",
    "date": "08/02/2026",
    "page_number": 0,
    "source_url": "https://...",
    "scraped_at": "2026-02-08T10:30:00"
  }
]
```

## Error Handling

- Failed pages are tracked and automatically retried at the end
- Supabase insertion errors are logged
- The script includes a 2-second delay between requests to avoid rate limiting

## Troubleshooting

**Missing API keys error:**
- Make sure you've created a `.env` file with all required credentials
- Check that the `.env` file is in the same directory as the script

**Firecrawl errors:**
- Verify your Firecrawl API key is valid
- Check that you have sufficient API credits

**Supabase errors:**
- Ensure your Supabase URL and key are correct
- Verify the table exists with the correct schema
- Check your Supabase RLS (Row Level Security) policies

## License

MIT

## Notes

- The script respects rate limits with built-in delays
- Batch processing reduces database calls
- All dates and content are preserved in their original format
