"""
Quick test to verify GPT-4.5.2 is working with your project
"""

import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

def test_analysis_llm():
    """Test that the analysis agent can connect to GPT-4.5.2"""
    
    print("=" * 60)
    print("Testing GPT-4.5.2 Connection for Analysis Agent")
    print("=" * 60)
    
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_DEPLOYMENT_NAME")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    
    print(f"\n📍 Endpoint: {endpoint}")
    print(f"🤖 Deployment: {deployment}")
    print(f"📅 API Version: {api_version}")
    print(f"🔑 API Key: {api_key[:20]}...{api_key[-10:]}\n")
    
    if not endpoint or not api_key or not deployment:
        print("❌ ERROR: Missing credentials in .env file!")
        return False
    
    try:
        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=api_key,
        )
        
        # Simple test prompt
        print("🧪 Testing with sample financial analysis...\n")
        
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": "You are a financial analyst. Output valid JSON only."},
                {"role": "user", "content": """
Analyze this article and return impacts as JSON:

"BIAT announces 20% profit increase for Q4 2025"

Return format:
{
    "impacts": [
        {
            "target": "BIAT",
            "type": "ticker",
            "sentiment_score": 3,
            "reasoning": "Strong profit growth"
        }
    ]
}
"""}
            ],
            max_completion_tokens=500
        )
        
        result = response.choices[0].message.content
        print("✅ Response received:")
        print(result)
        print(f"\n📊 Tokens used: {response.usage.total_tokens if response.usage else 'N/A'}")
        
        # Try to parse as JSON
        import json
        clean_result = result
        if "```json" in clean_result:
            clean_result = clean_result.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_result:
            clean_result = clean_result.split("```")[1].split("```")[0].strip()
        
        try:
            data = json.loads(clean_result)
            print("\n✅ Valid JSON returned!")
            print(f"   Impacts found: {len(data.get('impacts', []))}")
            return True
        except json.JSONDecodeError as e:
            print(f"\n⚠️  Warning: Response is not valid JSON: {e}")
            print("   But connection works! Prompts may need adjustment.")
            return True
            
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}")
        print(f"   {str(e)}")
        return False

if __name__ == "__main__":
    success = test_analysis_llm()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ GPT-4.5.2 is working correctly!")
        print("\n📝 Next steps:")
        print("   1. Run: python backfill_manager.py")
        print("   2. Watch for better sentiment analysis results")
        print("   3. GPT-4.5.2 should detect more nuanced impacts")
    else:
        print("❌ Connection failed!")
        print("\n💡 Check:")
        print("   1. .env file has correct credentials")
        print("   2. API key is valid")
        print("   3. Deployment name matches Azure portal")
    print("=" * 60)
