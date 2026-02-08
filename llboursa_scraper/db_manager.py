import os
import asyncio
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DBManager:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("Supabase URL or Key missing in .env")
        self.supabase: Client = create_client(url, key)
        
        # ELO Rating System Configuration
        self.K_FACTOR = 32  # Sensitivity to new information (higher = more volatile)
        self.INITIAL_RATING = 1500  # Starting point for all stocks
        self.MARKET_AVERAGE = 1500  # Reference point

    async def check_connection_and_setup(self):
        """
        Checks connection. Warns user if tables don't exist.
        """
        try:
            # Run a lightweight query to check 'scores' table
            await asyncio.to_thread(lambda: self.supabase.table("scores").select("ticker").limit(1).execute())
            print("Database connection verified.")
        except Exception as e:
            print(f"Database Warning: Could not access 'scores' table. Please run 'schema.sql' in your Supabase SQL Editor. Error: {e}")

    async def get_existing_urls(self):
        """
        Returns a set of all URLs already in 'articles' table.
        """
        try:
            response = await asyncio.to_thread(
                lambda: self.supabase.table("articles").select("url").execute()
            )
            data = response.data
            return set(item['url'] for item in data)
        except Exception as e:
            print(f"Error fetching existing URLs: {e}")
            return set()

    async def get_all_scores(self):
        """
        Returns dict {ticker: score}
        """
        try:
            response = await asyncio.to_thread(
                lambda: self.supabase.table("scores").select("ticker, score").execute()
            )
            return {item['ticker']: float(item['score']) for item in response.data}
        except Exception as e:
            print(f"Error fetching scores: {e}")
            return {}

    async def get_market_average(self):
        """
        Calculate current market average rating (for ELO system)
        """
        try:
            response = await asyncio.to_thread(
                lambda: self.supabase.table("scores").select("score").execute()
            )
            scores = [float(item['score']) for item in response.data]
            if not scores:
                return self.MARKET_AVERAGE
            return sum(scores) / len(scores)
        except Exception as e:
            print(f"Error calculating market average: {e}")
            return self.MARKET_AVERAGE

    async def initialize_scores(self, tickers):
        """
        Ensures all tickers exist in 'scores' table with ELO starting rating (1500).
        """
        current_scores = await self.get_all_scores()
        new_tickers = []
        for t in tickers:
            if t not in current_scores:
                new_tickers.append({"ticker": t, "score": float(self.INITIAL_RATING)})
        
        if new_tickers:
            print(f"Initializing {len(new_tickers)} new tickers with ELO rating {self.INITIAL_RATING}...")
            # Insert in chunks to be safe
            chunk_size = 100
            for i in range(0, len(new_tickers), chunk_size):
                chunk = new_tickers[i:i+chunk_size]
                try:
                    await asyncio.to_thread(
                        lambda: self.supabase.table("scores").upsert(chunk).execute()
                    )
                except Exception as e:
                    print(f"Error initializing scores: {e}")

    def calculate_elo_change(self, current_rating, sentiment_score, market_avg=None):
        """
        Calculate ELO rating change based on sentiment score.
        
        Args:
            current_rating: Current ELO rating of the stock
            sentiment_score: Sentiment from -5 to +5
            market_avg: Current market average (optional)
        
        Returns:
            float: Rating change to apply
        
        ELO Formula:
        - Expected score = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
        - New rating = old_rating + K * (actual_score - expected_score)
        
        We treat each news event as a "match" against the market average:
        - Positive news = "win" (actual_score closer to 1)
        - Negative news = "loss" (actual_score closer to 0)
        """
        if market_avg is None:
            market_avg = self.MARKET_AVERAGE
        
        # Convert sentiment (-5 to +5) to actual score (0 to 1)
        # -5 → 0 (total loss), 0 → 0.5 (draw), +5 → 1 (total win)
        actual_score = (sentiment_score + 5) / 10.0
        
        # Calculate expected score (probability of winning against market)
        expected_score = 1 / (1 + 10 ** ((market_avg - current_rating) / 400))
        
        # Calculate rating change
        rating_change = self.K_FACTOR * (actual_score - expected_score)
        
        return rating_change

    async def update_ticker_score(self, ticker, sentiment_delta, reason, article_id):
        """
        Updates a specific ticker's score using ELO rating system.
        
        Args:
            ticker: Stock ticker symbol
            sentiment_delta: Sentiment score from -5 to +5
            reason: Explanation for the change
            article_id: Reference to the article
        """
        try:
            # Get current score
            res = await asyncio.to_thread(
                lambda: self.supabase.table("scores").select("score").eq("ticker", ticker).execute()
            )
            if not res.data:
                print(f"Ticker {ticker} not found in DB. Skipping.")
                return

            current_rating = float(res.data[0]['score'])
            
            # Get market average for ELO calculation
            market_avg = await self.get_market_average()
            
            # Calculate ELO rating change
            rating_change = self.calculate_elo_change(current_rating, sentiment_delta, market_avg)
            new_rating = current_rating + rating_change
            
            # Update Score
            await asyncio.to_thread(
                lambda: self.supabase.table("scores").update({
                    "score": new_rating, 
                    "last_updated": "now()"
                }).eq("ticker", ticker).execute()
            )
            
            # Insert History
            await asyncio.to_thread(
                lambda: self.supabase.table("score_history").insert({
                    "ticker": ticker,
                    "change": rating_change,
                    "reason": f"[Sentiment: {sentiment_delta:+d}] {reason}",
                    "article_id": article_id
                }).execute()
            )
            
            print(f"      > ELO Update: {ticker} | Sentiment: {sentiment_delta:+d} | Rating: {current_rating:.1f} → {new_rating:.1f} ({rating_change:+.1f})")
            
        except Exception as e:
            print(f"Error updating score for {ticker}: {e}")

    async def update_ticker_score_simple(self, ticker, sentiment_delta, reason, article_id):
        """
        LEGACY: Simple addition scoring (kept for comparison)
        Updates a specific ticker's score by simple addition.
        """
        try:
            # Get current score
            res = await asyncio.to_thread(
                lambda: self.supabase.table("scores").select("score").eq("ticker", ticker).execute()
            )
            if not res.data:
                print(f"Ticker {ticker} not found in DB. Skipping.")
                return

            current_val = float(res.data[0]['score'])
            new_val = max(0, min(100, current_val + sentiment_delta))  # Clamp to 0-100
            
            # Update Score
            await asyncio.to_thread(
                lambda: self.supabase.table("scores").update({
                    "score": new_val, 
                    "last_updated": "now()"
                }).eq("ticker", ticker).execute()
            )
            
            # Insert History
            await asyncio.to_thread(
                lambda: self.supabase.table("score_history").insert({
                    "ticker": ticker,
                    "change": sentiment_delta,
                    "reason": reason,
                    "article_id": article_id
                }).execute()
            )
            print(f"      > Simple Update: {ticker} {sentiment_delta:+.1f} -> {new_val}")
            
        except Exception as e:
            print(f"Error updating score for {ticker}: {e}")