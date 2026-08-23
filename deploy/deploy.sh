#!/bin/bash
# ============================================
#  本地 Mac 一键部署：构建镜像 → 打包 → 上传 → 服务器加载启动
#  用法：./deploy/deploy.sh <服务器IP>
#  前提：本机已安装 Docker；服务器已配置 root 密码或 SSH 密钥免密
# ============================================
set -e

SERVER_IP="${1:?用法: ./deploy/deploy.sh <服务器IP>}"

cd "$(dirname "$0")/.."

echo "== [1/4] 本机构建 Next.js 生产镜像 =="
docker build -t personal-site:latest .

echo "== [2/4] 本地打包镜像（服务器内存小，不在服务器上构建）=="
# 确保基础镜像在本地存在，避免 save 失败
docker pull chromadb/chroma:0.5.23
docker pull snowdreamtech/frps:latest
docker save personal-site:latest chromadb/chroma:0.5.23 snowdreamtech/frps:latest -o /tmp/personal-site-deploy.tar

echo "== [3/4] 上传到服务器 =="
ssh "root@${SERVER_IP}" "mkdir -p /opt/personal-site"
scp /tmp/personal-site-deploy.tar deploy/docker-compose.server.yml deploy/frps.toml "root@${SERVER_IP}:/opt/personal-site/"

echo "== [4/4] 服务器加载镜像并启动 =="
ssh "root@${SERVER_IP}" 'bash -s' << 'REMOTE'
set -e
cd /opt/personal-site

# 安装 docker + compose 插件（Alibaba Cloud Linux，走阿里云镜像源）
if ! command -v docker &>/dev/null; then
  echo "安装 Docker..."
  dnf install -y dnf-utils
  dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/rhel/docker-ce.repo
  dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
fi
if ! docker compose version &>/dev/null; then
  dnf install -y docker-compose-plugin
fi

echo "加载镜像..."
docker load -i personal-site-deploy.tar
rm -f personal-site-deploy.tar

echo "启动服务..."
docker compose -f docker-compose.server.yml up -d
docker compose -f docker-compose.server.yml ps
echo ""
echo "部署完成。站点监听服务器本机 3000 端口，下一步配置 Nginx 反代 + 域名。"
REMOTE
