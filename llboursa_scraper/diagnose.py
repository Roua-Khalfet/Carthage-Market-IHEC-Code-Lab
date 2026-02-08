"""
Diagnostic script to identify URL extraction issues
"""

import asyncio
import json
from datetime import datetime


async def diagnose_discovery():
    """Run diagnostics on the discovery system"""
    
    print("=" * 80)
    print("🔬 DISCOVERY AGENT DIAGNOSTICS")
    print("=" * 80)
    print()
    
    test_date = "08/01/2026"
    
    # Test 1: Browser-use agent
    print("TEST 1: Browser-Use Agent")
    print("-" * 80)
    
    try:
        from discovery_agent import discovery_run
        
        print(f"📍 Testing date: {test_date}")
        result = await discovery_run(test_date)
        
        print(f"\n📤 Raw Result (first 500 chars):")
        print(result[:500])
        print("..." if len(result) > 500 else "")
        
        # Try to parse
        clean = result
        if "```json" in result:
            clean = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            clean = result.split("```")[1].split("```")[0].strip()
        
        try:
            articles = json.loads(clean)
            print(f"\n✅ Parsed {len(articles)} articles")
            
            # Analyze each article
            valid = 0
            invalid = 0
            truncated = 0
            
            for i, art in enumerate(articles, 1):
                url = art.get('url', '')
                title = art.get('title', '')
                
                print(f"\nArticle {i}:")
                print(f"  Title: {title[:60]}...")
                print(f"  URL: {url}")
                
                # Check for article ID
                if '_' in url:
                    try:
                        last_seg = url.split('/')[-1]
                        article_id = last_seg.split('_')[-1]
                        
                        if article_id.isdigit():
                            print(f"  ✅ Valid - ID: {article_id}")
                            valid += 1
                        else:
                            print(f"  ❌ Invalid - ID is not numeric: {article_id}")
                            invalid += 1
                    except:
                        print(f"  ❌ Invalid - Cannot extract ID")
                        invalid += 1
                else:
                    print(f"  ❌ Truncated - No underscore found")
                    truncated += 1
            
            print(f"\n📊 Summary:")
            print(f"  Valid URLs:     {valid}")
            print(f"  Invalid URLs:   {invalid}")
            print(f"  Truncated URLs: {truncated}")
            
            if truncated > 0 or invalid > 0:
                print(f"\n⚠️  URL EXTRACTION ISSUE DETECTED")
                print(f"  Recommendation: Use direct scraper or fix discovery agent")
            else:
                print(f"\n✅ All URLs valid!")
                
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON Parse Error: {e}")
            print(f"Cleaned result: {clean[:300]}...")
    
    except ImportError:
        print("❌ Cannot import discovery_agent.py")
    except Exception as e:
        print(f"❌ Browser-use test failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 2: Direct scraper
    print("\n" + "=" * 80)
    print("TEST 2: Direct HTTP Scraper")
    print("-" * 80)
    
    try:
        from direct_scraper import scrape_with_retry
        
        result = scrape_with_retry(test_date)
        articles = json.loads(result)
        
        print(f"✅ Found {len(articles)} articles")
        
        valid = 0
        for i, art in enumerate(articles[:3], 1):  # Show first 3
            url = art.get('url', '')
            title = art.get('title', '')
            article_id = url.split('_')[-1] if '_' in url else 'NONE'
            
            print(f"\nArticle {i}:")
            print(f"  Title: {title[:60]}...")
            print(f"  URL: {url}")
            print(f"  ID: {article_id}")
            
            if article_id.isdigit():
                valid += 1
        
        print(f"\n📊 Valid URLs: {valid}/{len(articles)}")
        
        if valid == len(articles):
            print("✅ Direct scraper working perfectly!")
        else:
            print("⚠️  Some URLs may be invalid")
            
    except ImportError:
        print("⚠️  direct_scraper.py not found - install backup scraper")
    except Exception as e:
        print(f"❌ Direct scraper test failed: {e}")
    
    # Test 3: Extraction
    print("\n" + "=" * 80)
    print("TEST 3: Content Extraction")
    print("-" * 80)
    
    try:
        from extraction_agent import extraction_run
        
        # Test with a known good URL (if available from previous tests)
        test_urls = [
            "https://www.ilboursa.com/marches/emploi-des-diplomes-une-aide-degressive-sur-cinq-ans-pour-les-employeurs-des-2026_58877",
            "https://www.ilboursa.com/marches/les-transferts-des-tunisiens-residant-a-letranger-atteignent-88-milliards-de-dinars-en-2025_58876"
        ]
        
        for url in test_urls[:1]:  # Test just one
            print(f"\n🧪 Testing: {url}")
            content = await extraction_run(url)
            
            if content and len(content) > 100:
                print(f"✅ Extraction successful - {len(content)} chars")
                print(f"Preview: {content[:150]}...")
                break
            else:
                print(f"❌ Extraction failed or too short")
    
    except Exception as e:
        print(f"❌ Extraction test failed: {e}")
    
    # Final recommendations
    print("\n" + "=" * 80)
    print("🎯 RECOMMENDATIONS")
    print("=" * 80)
    print()
    
    print("Based on the tests above:")
    print()
    print("If browser-use agent has truncated URLs:")
    print("  → Replace discovery_agent.py with discovery_agent_fixed.py")
    print("  → OR use direct_scraper.py as fallback")
    print()
    print("If direct scraper works but browser-use doesn't:")
    print("  → Use direct_scraper.py in backfill_manager.py")
    print()
    print("If both work:")
    print("  → Use backfill_manager_improved.py for automatic fallback")
    print()
    print("=" * 80)


async def test_url_patterns():
    """Test URL pattern matching"""
    
    print("\n" + "=" * 80)
    print("🧪 URL PATTERN VALIDATION TEST")
    print("=" * 80)
    print()
    
    test_urls = [
        ("https://www.ilboursa.com/marches/article-title_58877", True, "Valid"),
        ("https://www.ilboursa.com/marches/article-title", False, "Missing ID"),
        ("https://www.ilboursa.com/marches/article-title_abc", False, "Non-numeric ID"),
        ("https://www.ilboursa.com/actualites_bourse_tunis", False, "Navigation link"),
    ]
    
    for url, expected_valid, description in test_urls:
        # Validation logic
        is_valid = False
        
        if '_' in url:
            try:
                last_seg = url.split('/')[-1]
                article_id = last_seg.split('_')[-1]
                is_valid = article_id.isdigit()
            except:
                is_valid = False
        
        status = "✅" if is_valid == expected_valid else "❌"
        print(f"{status} {description:.<30} {url}")
        print(f"   Expected: {expected_valid}, Got: {is_valid}")
        print()


if __name__ == "__main__":
    print()
    asyncio.run(diagnose_discovery())
    asyncio.run(test_url_patterns())
    print()
