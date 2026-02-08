# from langchain_openai import AzureChatOpenAI  <-- Caused the error
from browser_use import Agent, ChatAzureOpenAI
from browser_config import get_local_browser
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def discovery_run(target_date: str):
    """
    Navigates to the news page, inputs the date, and extracts article URLs.
    Uses local browser with improved date handling.
    
    Args:
        target_date: Date in DD/MM/YYYY format (e.g., "06/01/2026")
    
    Returns:
        JSON string with list of articles
    """
    
    # Initialize Azure OpenAI using browser-use's wrapper
    # IMPORTANT: Use newer API version that supports json_schema
    llm = ChatAzureOpenAI(
        model=os.getenv("AZURE_DEPLOYMENT_NAME"),
        api_version="2024-08-01-preview",  # ✅ Fixed: Use newer API version
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    )

    # Initialize Local Browser
    browser = get_local_browser()
    
    task = f"""
You are navigating the ilboursa.com website to extract news articles for a SPECIFIC date.

**CRITICAL INSTRUCTIONS:**

1. **Navigate to the page:**
   - Go to https://www.ilboursa.com/marches/actualites_bourse_tunis
   - Wait 3 seconds for full page load

2. **Clear and set the date (VERY IMPORTANT):**
   - Find the date input field (usually has id="dateActu" or name="dateActu")
   - TRIPLE-CLICK the field to select all existing text
   - Press DELETE or BACKSPACE to completely clear it
   - Verify the field is empty before typing
   - Type EXACTLY: {target_date}
   - DO NOT use any other format - keep DD/MM/YYYY exactly as shown
   - DO NOT press ENTER yet

3. **Submit the date:**
   - Look for a button with text "AFFICHER" or "Rechercher" or similar
   - Click that button
   - Wait 5-7 seconds for the page to reload/update with new results

4. **Verify the date was applied:**
   - Check if the date field still shows {target_date}
   - If the results look like they didn't change, try clicking AFFICHER again
   - Wait another 3 seconds

5. **Extract articles:**
   - Find all article links in the results area (usually in a table or list)
   - Look for <a> tags with article URLs
   - Extract BOTH the title (link text) and href (URL)
   - Make sure URLs start with http:// or https://
   - If URLs are relative (start with /), prepend "https://www.ilboursa.com"
   
6. **Validate before returning:**
   - Check that you have at least 1 article (if 0, something went wrong)
   - Verify article titles are NOT all identical (means date filter failed)
   - Return a JSON array with objects containing 'title' and 'url'

**Expected output format:**
[
    {{"title": "Article Title 1", "url": "https://www.ilboursa.com/marches/..."}},
    {{"title": "Article Title 2", "url": "https://www.ilboursa.com/marches/..."}}
]

**Date you're searching for:** {target_date}

**IMPORTANT:** If the articles all have the same date in their titles or seem to be today's news instead of {target_date}, then the date filter FAILED. In that case, try the date input process again.
"""

    agent = Agent(
        task=task,
        llm=llm,
        browser=browser
    )

    try:
        history = await agent.run()
        result = history.final_result()
        
        # Basic validation
        if not result or result.strip() == "":
            print(f"  > Warning: Empty result from discovery agent for {target_date}")
            return "[]"
        
        # Check if result looks like it has articles
        if '"title"' not in result and '"url"' not in result:
            print(f"  > Warning: Result doesn't look like article JSON for {target_date}")
            print(f"  > Raw result: {result[:200]}")
        
        return result
        
    except Exception as e:
        print(f"  > Error in discovery_run: {e}")
        return "[]"