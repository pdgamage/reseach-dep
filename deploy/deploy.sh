#!/bin/bash
# ============================================================
# SmartHire - Deployment Script
# Run this after setup.sh, or called by GitHub Actions CI/CD
# Usage: cd /home/ubuntu/smarthire && ./deploy/deploy.sh
# ============================================================

set -e

PROJECT_DIR="/home/ubuntu/smarthire"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  SmartHire - Deploying..."
echo "  $(date)"
echo "=========================================="

# ------- 1. Install Node.js Server Dependencies -------
echo "[1/5] Installing Node.js server dependencies..."
cd "$PROJECT_DIR/server"
npm install --production
echo "   ✅ Server dependencies installed"

# ------- 2. Install Frontend Dependencies & Build -------
echo "[2/5] Building React frontend..."
cd "$PROJECT_DIR/frontend"
npm install
npm run build
echo "   ✅ Frontend built to dist/"

# ------- 3. Verify Python Virtual Environment -------
# NOTE: The Python ML environment (.venv) is a ONE-TIME manual setup.
# It includes large packages like torch (530MB) that cannot be reliably
# installed via pip during deploy. Run setup manually using the instructions
# in deploy/setup.sh if this check fails.
echo "[3/5] Verifying Python ML backend..."
cd "$PROJECT_DIR/backend"
if [ -d ".venv" ] && [ -f ".venv/bin/python3" ]; then
    # Quick smoke test to confirm key packages are importable
    if .venv/bin/python3 -c "from PIL import Image; import torch; import paddleocr" 2>/dev/null; then
        echo "   ✅ Python .venv is healthy (PIL, torch, paddleocr OK)"
    else
        echo "   ⚠️  WARNING: .venv exists but some ML packages may be missing."
        echo "   Run manual setup: source .venv/bin/activate && pip install -r requirements.txt"
        echo "   Continuing deploy (server will start but CV parsing may fail)..."
    fi
else
    echo "   ❌ ERROR: Python .venv not found at $PROJECT_DIR/backend/.venv"
    echo "   CV parsing will be unavailable until you manually set up the venv."
    echo "   See deploy/setup.sh for instructions."
    echo "   Continuing deploy anyway..."
fi

# ------- 4. Configure Nginx -------
echo "[4/5] Configuring Nginx..."
sudo cp "$PROJECT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/smarthire
sudo ln -sf /etc/nginx/sites-available/smarthire /etc/nginx/sites-enabled/smarthire
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "   ✅ Nginx configured and reloaded"

# ------- 5. Start/Restart Node.js Server with PM2 -------
echo "[5/5] Starting Node.js server with PM2..."
mkdir -p "$PROJECT_DIR/logs"

# Check if already running
if pm2 describe smarthire-api > /dev/null 2>&1; then
    echo "   Restarting existing PM2 process..."
    pm2 restart smarthire-api
else
    echo "   Starting new PM2 process..."
    pm2 start "$PROJECT_DIR/deploy/ecosystem.config.cjs"
fi

pm2 save
# Setup PM2 startup (ignore errors if already set)
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "  Your app is live at:"
echo "  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<your-ec2-ip>')"
echo ""
echo "  Useful commands:"
echo "    pm2 status              - Check server status"
echo "    pm2 logs smarthire-api  - View live logs"
echo "    pm2 restart smarthire-api - Restart server"
echo "=========================================="
