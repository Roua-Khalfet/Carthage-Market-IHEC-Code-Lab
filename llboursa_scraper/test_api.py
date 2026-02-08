import anthropic
import os

# Your credentials - USE ENVIRONMENT VARIABLES
api_key = os.getenv("ANTHROPIC_API_KEY", "")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY environment variable is required")
model = "claude-sonnet-4-20250514"  # Complete model string

# Test the API
client = anthropic.Anthropic(api_key=api_key)

try:
    message = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Hello! Just testing."}
        ]
    )
    print("✓ API Key is valid!")
    print("✓ Model is correct!")
    print(f"\nResponse: {message.content[0].text}")
except anthropic.AuthenticationError:
    print("✗ API Key is invalid")
except anthropic.NotFoundError:
    print("✗ Model string is incorrect")
except Exception as e:
    print(f"✗ Error: {e}")