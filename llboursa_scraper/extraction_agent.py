import asyncio
from playwright.async_api import async_playwright

async def extraction_run(url: str):
    """
    Extracts content from a single URL using a local Playwright instance.
    """
    print(f"Extracting content from: {url}")
    
    async with async_playwright() as p:
        # Launch local browser (headless=True for background execution)
        browser = await p.chromium.launch(headless=True)
        
        try:
            page = await browser.new_page()
            await page.goto(url, timeout=60000)
            
            # Simple extraction logic (can be enhanced)
            # Try to get the main article body
            # Adjust selector based on actual site structure. 
            # Often 'article' tag or specific class.
            content = await page.evaluate("""() => {
                const article = document.querySelector('article') || document.querySelector('.news-body') || document.body;
                return article.innerText;
            }""")
            
            return content
            
        except Exception as e:
            print(f"Error extracting {url}: {e}")
            return ""
        finally:
            await browser.close()
