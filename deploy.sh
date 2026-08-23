#!/bin/bash
set -e

echo "======================================"
echo "  部署个人主页到阿里云"
echo "======================================"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}正在安装 Docker...${NC}"
    # 本地 Mac 安装 Docker
    if command -v brew &> /dev/null; then
        brew install --cask docker
    else
        echo "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
fi

# 检查是否在项目目录
if [ ! -f "docker-compose.yml" ]; then
    echo "请在 personal-site 目录下执行此脚本"
    exit 1
fi

echo -e "${GREEN}1. 构建 Docker 镜像...${NC}"
docker build -t personal-site:latest .

echo -e "${GREEN}2. 打包镜像为 tar 文件...${NC}"
docker save personal-site:latest -o personal-site.tar

echo -e "${GREEN}3. 上传到阿里云...${NC}"
read -p "请输入阿里云服务器 IP: " SERVER_IP
read -p "请输入 root 密码: " -s PASSWORD
echo ""

# 使用 scp 上传
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no personal-site.tar root@$SERVER_IP:/tmp/

echo -e "${GREEN}4. 在阿里云加载镜像并启动...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'ENDSSH'
    # 安装必要工具
    yum install -y docker.io docker-compose
    
    # 启动 Docker
    systemctl start docker
    systemctl enable docker
    
    # 加载镜像
    docker load -i /tmp/personal-site.tar
    
    # 创建数据目录
    mkdir -p /www/personal-site
    cd /www/personal-site
    
    # 创建 docker-compose.yml（服务器版本）
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    image: personal-site:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      # 阶段1 配好 frp 后改成实际穿透地址
      - OLLAMA_BASE_URL=https://ollama.chensuipian02004.icu
      - LLM_MODEL=qwen2.5:7b
      - EMBEDDING_MODEL=nomic-embed-text
      - CHROMA_ENDPOINT=http://chroma:8000
    depends_on:
      chroma:
        condition: service_healthy
    restart: unless-stopped

  chroma:
    image: chromadb/chroma:0.5.23
    volumes:
      - chroma-data:/data
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/heartbeat')"]
      interval: 5s
      timeout: 3s
      retries: 20
      start_period: 10s
    restart: unless-stopped

volumes:
  chroma-data:
EOF

    # 启动服务
    docker-compose up -d
    
    echo "部署完成！"
    echo "请访问: http://$SERVER_IP:3000"
ENDSSH

# 清理本地临时文件
rm -f personal-site.tar

echo -e "${GREEN}======================================"
echo "  部署成功！"
echo "======================================"
echo ""
echo "下一步："
echo "1. 在你的 Windows 电脑上配置 frpc（连接到阿里云）"
echo "2. 确保本地 Ollama 服务正在运行"
echo "3. 访问 http://$SERVER_IP:3000 查看网站"
