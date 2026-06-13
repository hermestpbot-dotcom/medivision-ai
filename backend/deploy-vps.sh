#!/bin/bash
# ============================================================
# MediVision AI — Oracle Cloud VPS Deployment Script
# Run this on a fresh Ubuntu 22.04 VPS
# ============================================================

set -e

echo "🚀 MediVision AI — VPS Deployment"
echo "==================================="

# 1. System updates
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. You may need to log out and back in."
fi

# 3. Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx certbot python3-certbot-nginx

# 5. Clone repo
echo "📥 Cloning repository..."
cd /home/ubuntu
if [ ! -d "medivision-ai" ]; then
    git clone https://github.com/hermestpbot-dotcom/medivision-ai.git
fi
cd medivision-ai/backend

# 6. Create .env
echo "⚙️  Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Edit .env with your actual values before starting!"
    echo "   nano .env"
fi

# 7. Build and start
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# 8. Configure Nginx reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/medivision > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    location /uploads/ {
        alias /home/ubuntu/medivision-ai/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/medivision /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 9. Setup SSL (optional — requires domain)
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Backend running at: http://$(curl -s ifconfig.me)"
echo "API docs at: http://$(curl -s ifconfig.me)/api/v1/docs"
echo ""
echo "To add SSL (requires a domain):"
echo "  sudo certbot --nginx -d yourdomain.com"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Edit .env with your MongoDB Atlas URL"
echo "  2. Generate JWT secrets"
echo "  3. Update CORS_ORIGINS with your Vercel URL"
echo "  4. Open port 80 and 443 in Oracle Cloud Security List"
