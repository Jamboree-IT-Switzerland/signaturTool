#!/bin/bash
# Deployment script for Mova Signature Generator

echo "🚀 Deploying Mova Signature Generator..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

# Check if configuration files exist
if [ ! -f "src/config/app-config.json" ] || [ ! -f "src/config/translations.json" ]; then
    echo "❌ Error: Configuration files missing. Please check src/config/ directory."
    exit 1
fi

# Build (no build step needed for static app)
echo "✅ No build step required for pure client-side application"

# Copy files to dist directory (optional, for deployment)
if [ "$1" = "--build-dist" ]; then
    echo "📦 Creating distribution package..."
    rm -rf dist
    mkdir -p dist
    cp index.html dist/
    cp -r src dist/
    cp package.json dist/
    cp README.md dist/
    echo "✅ Distribution package created in ./dist/"
fi

# Test configuration files
echo "🔍 Validating configuration files..."
if command -v node >/dev/null 2>&1; then
    node -e "
        try {
            JSON.parse(require('fs').readFileSync('src/config/app-config.json', 'utf8'));
            JSON.parse(require('fs').readFileSync('src/config/translations.json', 'utf8'));
            console.log('✅ Configuration files are valid JSON');
        } catch (e) {
            console.error('❌ Invalid JSON in configuration files:', e.message);
            process.exit(1);
        }
    "
else
    echo "⚠️  Node.js not found. Skipping JSON validation."
fi

echo "🎉 Deployment ready! You can now:"
echo "   • Upload files to your static hosting service"
echo "   • Serve with: npm run start"
echo "   • Develop with: npm run dev"
