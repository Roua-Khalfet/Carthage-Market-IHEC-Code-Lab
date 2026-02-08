#!/bin/bash

echo "🚀 Setting up Daily News Monitor"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
playwright install chromium
playwright install-deps

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating template .env file..."
    cat > .env << EOF
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-api-key-here
AZURE_DEPLOYMENT_NAME=gpt-5.2-chat
AZURE_API_VERSION=2024-12-01-preview

# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
EOF
    echo "✅ Template .env created. Please edit it with your credentials."
    echo ""
    echo "To edit: nano .env"
else
    echo "✅ .env file found"
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials: nano .env"
echo "2. Test the monitor: python daily_monitor.py"
echo "3. Set up cron job for automatic runs"
echo ""
echo "To run the monitor manually:"
echo "  source venv/bin/activate"
echo "  python daily_monitor.py"
echo ""
echo "To set up cron (daily at 8 AM):"
echo "  crontab -e"
echo "  Add: 0 8 * * * cd $(pwd) && venv/bin/python daily_monitor.py >> monitor.log 2>&1"
echo ""
