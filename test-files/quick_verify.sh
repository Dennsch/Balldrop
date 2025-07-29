#!/bin/bash

# Quick verification that the scoring changes are working
echo "🎯 Quick verification of scoring implementation..."

# Compile TypeScript
echo "📦 Compiling TypeScript..."
npx tsc

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Run the scoring verification script
echo "🧪 Running scoring verification..."
node verify_scoring_changes.js

echo "✅ Verification complete!"