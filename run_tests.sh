#!/bin/bash

echo "🔍 Building and testing the current implementation..."

# Build the TypeScript code
echo "📦 Building TypeScript..."
npm run build

# Run the verification test
echo "🧪 Running requirement verification test..."
node test_requirement_verification.js

# Run the existing tests
echo "🧪 Running Jest tests..."
npm test

echo "✅ All tests completed!"