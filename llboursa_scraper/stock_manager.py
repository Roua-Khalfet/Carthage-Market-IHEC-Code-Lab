import json
import os

class StockManager:
    def __init__(self, sector_file="tunisian_stocks_by_sector.json", score_file="current_scores.json"):
        self.sector_file = sector_file
        self.score_file = score_file
        self.stocks_data = self._load_sector_data()
        self.scores = self._load_or_initialize_scores()

    def _load_sector_data(self):
        if not os.path.exists(self.sector_file):
            raise FileNotFoundError(f"Sector file {self.sector_file} not found.")
        with open(self.sector_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_or_initialize_scores(self):
        """
        Loads existing scores or initializes all to 50.
        Returns a dict: {ticker: score}
        """
        if os.path.exists(self.score_file):
            print(f"Loading existing scores from {self.score_file}")
            with open(self.score_file, "r", encoding="utf-8") as f:
                return json.load(f)
        
        print("Initializing new scores to 50.")
        scores = {}
        # Iterate through all sectors and stocks
        for sector, stock_list in self.stocks_data.items():
            for stock in stock_list:
                # Use ticker as the unique key
                scores[stock['ticker']] = 50.0
        return scores

    def get_all_tickers(self):
        return list(self.scores.keys())

    def get_sectors(self):
        return list(self.stocks_data.keys())

    def update_score(self, target, impact_type, sentiment_score):
        """
        Updates scores based on impact.
        target: ticker name or sector name
        impact_type: 'ticker' or 'sector'
        sentiment_score: float/int amount to change
        """
        
        # Validation and Logic
        if impact_type == "sector":
            # Normalize target to match json keys (lowercase, underscores)
            sector_key = target.lower().replace(" ", "_")
            if sector_key not in self.stocks_data:
                # Try partial match or robust finding if needed, 
                # but for now assume LLM gives good keys or we map them.
                # Let's try to map "Banking" -> "banks", etc. if strictly needed.
                # For now, strict check.
                print(f"Warning: Sector '{target}' not found. Skipping update.")
                return 0
            
            affected_stocks = self.stocks_data[sector_key]
            count = 0
            for stock in affected_stocks:
                ticker = stock['ticker']
                if ticker in self.scores:
                    self.scores[ticker] += sentiment_score
                    count += 1
            print(f"Updated {count} stocks in sector '{target}' by {sentiment_score}")
            return count

        elif impact_type == "ticker":
            if target in self.scores:
                self.scores[target] += sentiment_score
                print(f"Updated ticker '{target}' by {sentiment_score}. New score: {self.scores[target]}")
                return 1
            else:
                print(f"Warning: Ticker '{target}' not found in universe. Skipping.")
                return 0
        
        return 0

    def save_scores(self):
        with open(self.score_file, "w", encoding="utf-8") as f:
            json.dump(self.scores, f, indent=4)
        print(f"Scores saved to {self.score_file}")
    
    def get_stocks_in_sector(self, sector):
        return [s['ticker'] for s in self.stocks_data.get(sector, [])]

if __name__ == "__main__":
    # Test
    sm = StockManager()
    print(f"Total tracked stocks: {len(sm.scores)}")
    # sm.update_score("banks", "sector", -2)
    # sm.save_scores()
