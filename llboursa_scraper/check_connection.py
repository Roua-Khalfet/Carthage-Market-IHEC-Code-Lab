import asyncio
import os
import websockets
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    wss_url = os.getenv("BRIGHT_DATA_BROWSER_WS_URL")
    print(f"Testing URL: {wss_url}")
    
    if not wss_url:
        print("Error: BRIGHT_DATA_BROWSER_WS_URL is empty")
        return

    try:
        print("Attempting connection...")
        async with websockets.connect(wss_url) as ws:
            print("Successfully connected to Bright Data!")
            await ws.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
