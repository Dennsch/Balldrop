#!/bin/bash

echo "🚀 Running Mobile Responsiveness Verification..."
echo "================================================"

# Change to the workspace directory
cd /workspace

# Run the mobile responsiveness verification
node test-files/verify_mobile_responsiveness.js

echo ""
echo "📱 Mobile Responsiveness Verification Complete!"
echo ""
echo "Next steps to test on actual devices:"
echo "1. npm run build:react"
echo "2. npm run serve"
echo "3. Open the URL on mobile devices"
echo "4. Test touch interactions and responsiveness"
echo ""
echo "Or test the static HTML file:"
echo "1. Open test-mobile-responsiveness.html in a mobile browser"
echo "2. Test column selector touch interactions"
echo "3. Verify grid scaling and readability"