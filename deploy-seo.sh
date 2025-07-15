#!/bin/bash

echo "🚀 Deploying Bookshop with SEO optimizations..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to VPS
echo "🌐 Deploying to VPS..."
ssh root@209.74.83.122 << 'EOF'
    cd /root/deployment/bookshop
    
    # Pull latest changes
    git pull origin main
    
    # Stop and remove existing container
    docker stop bookshop-app || true
    docker rm bookshop-app || true
    
    # Build new image
    docker build -t bookshop-app .
    
    # Start new container
    docker run -d \
        --name bookshop-app \
        --restart unless-stopped \
        -p 80:80 \
        bookshop-app
    
    echo "✅ Deployment completed!"
    echo "🌍 Site available at: http://209.74.83.122"
EOF

echo "🎉 SEO-optimized Bookshop deployed successfully!"
echo "🔍 Check the site at: http://209.74.83.122"
echo ""
echo "📋 SEO Features Added:"
echo "   ✅ Professional favicon and icons"
echo "   ✅ Comprehensive meta tags"
echo "   ✅ Open Graph and Twitter Cards"
echo "   ✅ Social media thumbnails"
echo "   ✅ Structured data (JSON-LD)"
echo "   ✅ Sitemap and robots.txt"
echo "   ✅ Web app manifest"
echo "   ✅ Dynamic SEO management"
echo ""
echo "🛠️ Next steps:"
echo "   1. Generate actual PNG favicons using generate-favicons.html"
echo "   2. Test social media sharing"
echo "   3. Submit sitemap to Google Search Console"
echo "   4. Monitor SEO performance" 