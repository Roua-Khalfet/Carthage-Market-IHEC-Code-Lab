import asyncio
import os
import json
from datetime import datetime, timedelta
from discovery_agent import discovery_run
from extraction_agent import extraction_run
from analysis_agent import analyze_article
from stock_manager import StockManager
from db_manager import DBManager
from dotenv import load_dotenv

load_dotenv()

async def backfill_process():
    print("=" * 80)
    print("📰 TUNISIAN STOCK MARKET NEWS SCRAPER")
    print("=" * 80)
    print()
    
    # Initialize Managers
    sm_data = StockManager()
    db = DBManager()
    
    # Setup Database
    await db.check_connection_and_setup()
    
    # Get existing processed URLs to skip
    existing_urls = await db.get_existing_urls()
    print(f"📚 Found {len(existing_urls)} existing articles in database")
    print("=" * 80)
    
    # Calculate dates: Today minus 30 days
    today = datetime.now()
    days_to_backfill = 30
    
    # Track statistics
    total_articles_found = 0
    total_articles_processed = 0
    total_articles_skipped = 0
    total_impacts_found = 0
    
    # Track articles by URL to detect duplicates across dates
    articles_by_url = {}
    
    for i in range(days_to_backfill, -1, -1):
        target_date_obj = today - timedelta(days=i)
        target_date_str = target_date_obj.strftime("%d/%m/%Y")
        
        print(f"\n{'='*80}")
        print(f"📅 DATE: {target_date_str}")
        print(f"{'='*80}")
        
        try:
            # Discovery Phase
            print(f"  🔍 Discovering articles...")
            discovery_res = await discovery_run(target_date_str)
            
            # Clean JSON
            if "```json" in discovery_res:
                discovery_res = discovery_res.split("```json")[1].split("```")[0].strip()
            elif "```" in discovery_res:
                discovery_res = discovery_res.split("```")[1].split("```")[0].strip()
            
            try:
                articles = json.loads(discovery_res)
            except json.JSONDecodeError as e:
                print(f"  ❌ Failed to parse discovery results: {e}")
                continue
            
            if not articles:
                print(f"  ℹ️  No articles found for {target_date_str}")
                continue
            
            total_articles_found += len(articles)
            print(f"  ✅ Found {len(articles)} articles")
            
            # Filter duplicates
            duplicate_count = 0
            new_articles = []
            
            for art in articles:
                url = art.get('url')
                if url:
                    if url in articles_by_url:
                        duplicate_count += 1
                        print(f"  ⚠️  Duplicate: {art.get('title', 'Unknown')[:50]}...")
                    else:
                        articles_by_url[url] = target_date_str
                        new_articles.append(art)
            
            if duplicate_count > 0:
                print(f"  ℹ️  Filtered {duplicate_count} duplicate URLs")
            
            if not new_articles:
                print(f"  ⚠️  All articles are duplicates - skipping date")
                continue
            
            # Process each article
            for idx, art in enumerate(new_articles, 1):
                url = art.get('url')
                title = art.get('title', 'Unknown Title')
                
                if not url:
                    print(f"\n  [{idx}/{len(new_articles)}] ⚠️  Skipping - no URL")
                    total_articles_skipped += 1
                    continue
                
                # Check if already in database
                if url in existing_urls:
                    print(f"\n  [{idx}/{len(new_articles)}] ⏭️  Already in DB: {title[:50]}...")
                    total_articles_skipped += 1
                    continue
                
                print(f"\n  [{idx}/{len(new_articles)}] 📄 {title[:60]}...")
                
                # Validate URL format (should have article ID at end)
                if '_' not in url.split('/')[-1]:
                    print(f"    ⚠️  URL might be truncated (no article ID)")
                    print(f"    URL: {url}")
                
                # Extract content
                content = await extraction_run(url)
                
                if not content or len(content.strip()) < 100:
                    print(f"    ❌ Skipping - content extraction failed or too short")
                    total_articles_skipped += 1
                    continue
                
                # Analyze sentiment
                print(f"    🤖 Analyzing with GPT-4.5.2...")
                analysis_raw = analyze_article(content)
                
                # Clean analysis
                clean_analysis = analysis_raw
                if "```json" in clean_analysis:
                    clean_analysis = clean_analysis.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_analysis:
                    clean_analysis = clean_analysis.split("```")[1].split("```")[0].strip()
                
                try:
                    analysis_data = json.loads(clean_analysis)
                    impacts = analysis_data.get("impacts", [])
                    
                    # Expand sector impacts to individual tickers
                    expanded_impacts = []
                    
                    for impact in impacts:
                        target = impact.get("target")
                        itype = impact.get("type")
                        score = impact.get("sentiment_score")
                        reason = impact.get("reasoning", "")
                        
                        if not target or score is None:
                            continue
                        
                        if itype == "sector":
                            # Resolve sector to tickers
                            sector_key = target.lower().replace(" ", "_")
                            
                            if sector_key in sm_data.stocks_data:
                                tickers = [s['ticker'] for s in sm_data.stocks_data[sector_key]]
                                
                                # Add sector-level impact
                                expanded_impacts.append({
                                    "target": target,
                                    "type": "sector",
                                    "sentiment_score": score,
                                    "reasoning": reason
                                })
                                
                                # Add individual ticker impacts
                                for ticker in tickers:
                                    expanded_impacts.append({
                                        "target": ticker,
                                        "type": "ticker",
                                        "sentiment_score": score,
                                        "reasoning": f"[Via {target} sector] {reason}"
                                    })
                                
                                print(f"    📊 Sector '{target}' → {len(tickers)} tickers (score: {score:+d})")
                            else:
                                print(f"    ⚠️  Sector '{target}' not found in stock data")
                        
                        elif itype == "ticker":
                            expanded_impacts.append(impact)
                            print(f"    📈 Ticker '{target}' (score: {score:+d})")
                    
                    # Save to database
                    article_id = await db.save_article_with_impacts(
                        url=url,
                        title=title,
                        content=content,
                        published_date=target_date_str,
                        impacts=expanded_impacts
                    )
                    
                    if article_id:
                        existing_urls.add(url)
                        total_articles_processed += 1
                        total_impacts_found += len(expanded_impacts)
                        
                        if expanded_impacts:
                            print(f"    ✅ Saved with {len(expanded_impacts)} impacts")
                        else:
                            print(f"    ✅ Saved (no market impact)")
                    else:
                        total_articles_skipped += 1
                    
                except json.JSONDecodeError as e:
                    print(f"    ❌ Failed to parse analysis: {e}")
                    total_articles_skipped += 1
        
        except Exception as e:
            print(f"\n❌ Error processing {target_date_str}: {e}")
            import traceback
            traceback.print_exc()
    
    # Final Summary
    print("\n" + "=" * 80)
    print("✅ BACKFILL COMPLETE!")
    print("=" * 80)
    print(f"\n📊 Statistics:")
    print(f"   Articles discovered: {total_articles_found}")
    print(f"   Articles processed:  {total_articles_processed}")
    print(f"   Articles skipped:    {total_articles_skipped}")
    print(f"   Stock impacts:       {total_impacts_found}")
    
    # Get sentiment summary
    print(f"\n📈 Top Mentioned Stocks:")
    sentiment_summary = await db.get_stock_sentiment_summary()
    
    if sentiment_summary:
        # Sort by mention count
        sorted_stocks = sorted(
            sentiment_summary.items(),
            key=lambda x: x[1]['mention_count'],
            reverse=True
        )[:10]
        
        for stock, data in sorted_stocks:
            print(f"   {stock:.<40} {data['mention_count']} mentions | "
                  f"Avg sentiment: {data['avg_sentiment']:+.1f}")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    asyncio.run(backfill_process())