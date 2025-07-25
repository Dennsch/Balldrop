#!/bin/bash
cd /workspace

echo "Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "\nBuild successful! Running verification..."
    node verify_fix.mjs
    
    echo -e "\nRunning tests..."
    npm test
else
    echo "Build failed!"
    exit 1
fi