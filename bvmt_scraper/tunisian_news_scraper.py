#!/usr/bin/env python3
"""
Tunisian News Scraper
Scrapes financial news from BVMT website and stores in Supabase
"""

import os
import json
import re
import time
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv

from agno.agent import Agent
from agno.tools.firecrawl import FirecrawlTools
from agno.models.anthropic import Claude
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
BATCH_SIZE = 5  # Process 5 pages before inserting to DB


class TunisianNewsScaper:
    """Main scraper class for Tunisian financial news"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize the scraper with Supabase credentials"""
        self.supabase = create_client(supabase_url, supabase_key)
        self.agent = Agent(
            model=Claude(),
            tools=[FirecrawlTools(enable_scrape=True)],
            debug_mode=False
        )
        self.total_scraped = 0
        self.failed_pages = []

    def extract_json(self, text: str) -> List[Dict]:
        """Extract JSON array from response text"""
        # Try to find JSON in code blocks
        json_match = re.search(r'```json\s*(\[.*?\])\s*```', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        # Try to find raw JSON array
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))

        return []

    def scrape_page(self, page_num: int) -> List[Dict]:
        """Scrape a single page of news articles"""
        url = (
            f"https://www.bvmt.com.tn/fr/actualites?uid=0&datedebut=&datefin="
            if page_num == 0
            else f"https://www.bvmt.com.tn/fr/actualites?uid=0&datedebut=&datefin=&page={page_num}"
        )

        print(f"📄 Page {page_num}: {url}")

        try:
            response = self.agent.run(
                f"""Scrape {url}

                Extract all news articles. Return ONLY a JSON array:
                [
                    {{
                        "title": "title here",
                        "content": "content here",
                        "date": "DD/MM/YYYY"
                    }}
                ]"""
            )

            articles = self.extract_json(response.content)

            # Add metadata to each article
            for article in articles:
                article['page_number'] = page_num
                article['source_url'] = url
                article['scraped_at'] = datetime.now().isoformat()

            print(f"✅ Found {len(articles)} articles")
            return articles

        except Exception as e:
            print(f"❌ Error on page {page_num}: {e}")
            self.failed_pages.append(page_num)
            return []

    def insert_batch(self, articles: List[Dict]):
        """Insert a batch of articles to Supabase"""
        if not articles:
            return

        try:
            result = self.supabase.table('tunisian_news').insert(articles).execute()
            print(f"💾 Inserted {len(articles)} articles to Supabase")
            self.total_scraped += len(articles)
        except Exception as e:
            print(f"❌ Supabase error: {e}")

    def scrape_all(self, start_page: int = 0, end_page: int = 20):
        """Scrape all pages with batch processing"""
        batch = []

        for page_num in range(start_page, end_page + 1):
            articles = self.scrape_page(page_num)
            batch.extend(articles)

            # Insert batch every BATCH_SIZE pages or at the end
            if len(batch) >= BATCH_SIZE * 10 or page_num == end_page:
                self.insert_batch(batch)
                batch = []

            # Delay between requests to avoid rate limiting
            if page_num < end_page:
                time.sleep(2)

        print(f"\n{'='*50}")
        print(f"🎉 Scraping Complete!")
        print(f"📊 Total articles: {self.total_scraped}")
        print(f"❌ Failed pages: {self.failed_pages if self.failed_pages else 'None'}")
        print(f"{'='*50}")

        # Retry failed pages
        if self.failed_pages:
            print(f"\n🔄 Retrying {len(self.failed_pages)} failed pages...")
            retry_batch = []
            for page_num in self.failed_pages[:]:
                articles = self.scrape_page(page_num)
                if articles:
                    retry_batch.extend(articles)
                    self.failed_pages.remove(page_num)
                time.sleep(2)

            if retry_batch:
                self.insert_batch(retry_batch)

    def save_to_file(self, filename: str = "tunisian_news.json"):
        """Alternative method to save scraped data to a local JSON file"""
        all_articles = []
        
        for page_num in range(0, 21):
            articles = self.scrape_page(page_num)
            all_articles.extend(articles)
            time.sleep(2)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(all_articles, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved {len(all_articles)} articles to {filename}")


def main():
    """Main entry point"""
    # Validate environment variables
    if not all([SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_API_KEY, FIRECRAWL_API_KEY]):
        print("❌ Error: Missing required environment variables!")
        print("Please check your .env file and ensure all variables are set:")
        print("  - SUPABASE_URL")
        print("  - SUPABASE_KEY")
        print("  - ANTHROPIC_API_KEY")
        print("  - FIRECRAWL_API_KEY")
        return

    # Initialize and run scraper
    scraper = TunisianNewsScaper(
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )

    # Run scraper for pages 0-20
    scraper.scrape_all(start_page=0, end_page=20)
    
    # Alternative: Save to local file instead
    # scraper.save_to_file("tunisian_news.json")


if __name__ == "__main__":
    main()
