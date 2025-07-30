#!/bin/bash

echo "🎮 Running Hard Mode Turn-by-Turn Test"
echo "======================================"

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Run the test
echo "🧪 Running hard mode test..."
node test-files/test_hard_mode_turn_by_turn.js

echo ""
echo "🎯 Test completed!"