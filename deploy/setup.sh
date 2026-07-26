#!/bin/bash
# ============================================================
# SmartHire - EC2 First-Time Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 EC2 instance
# Usage: chmod +x setup.sh && sudo ./setup.sh
# ============================================================

set -e

echo "=========================================="
echo "  SmartHire - EC2 Server Setup"
echo "  Instance Type: t3.small (2GB RAM)"
echo "=========================================="

# ------- 1. System Updates -------
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# ------- 2. Create 4GB Swap Space (critical for ML on t3.small) -------
echo "[2/8] Creating 4GB swap space for ML processing..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swap settings for ML workloads
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "   ✅ 4GB swap created and enabled"
else
    echo "   ⏭️  Swap already exists, skipping"
fi

# ------- 3. Install Node.js 20.x -------
echo "[3/8] Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   ✅ Node.js $(node -v) installed"

# ------- 4. Install Python 3.10 + System Libraries -------
echo "[4/8] Installing Python 3.10 and system dependencies..."
apt install -y software-properties-common
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.10 python3.10-venv python3.10-dev python3-pip
# Libraries required by OpenCV, PaddlePaddle, pdf2image
apt install -y poppler-utils libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev
echo "   ✅ Python 3.10 installed"

# ------- 5. Install Nginx -------
echo "[5/8] Installing Nginx..."
apt install -y nginx
systemctl enable nginx
echo "   ✅ Nginx installed"

# ------- 6. Install PM2 -------
echo "[6/8] Installing PM2 process manager..."
npm install -g pm2
echo "   ✅ PM2 $(pm2 --version) installed"

# ------- 7. Install Git -------
echo "[7/8] Installing Git..."
apt install -y git
echo "   ✅ Git installed"

# ------- 8. Create project directories -------
echo "[8/8] Creating project directories..."
mkdir -p /home/ubuntu/smarthire/logs
mkdir -p /home/ubuntu/smarthire/server/uploads
chown -R ubuntu:ubuntu /home/ubuntu/smarthire

echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "  Next steps:"
echo "  1. Switch to ubuntu user:  su - ubuntu"
echo "  2. Clone your repo:"
echo "     git clone https://github.com/YOUR_USER/smarthire.git /home/ubuntu/smarthire"
echo "  3. Run the deploy script:"
echo "     cd /home/ubuntu/smarthire && chmod +x deploy/deploy.sh && ./deploy/deploy.sh"
echo ""
echo "  Memory Info:"
free -h
echo ""
echo "  Swap Info:"
swapon --show
echo "=========================================="
