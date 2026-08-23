#!/bin/bash
# ============================================
#  家里 Mac：下载 frp 客户端并启动（Ollama 隧道）
#  用法：./deploy/setup-frpc-mac.sh <服务器IP>
# ============================================
set -e

SERVER_IP="${1:?用法: ./deploy/setup-frpc-mac.sh <服务器IP>}"

cd "$(dirname "$0")"

# 检测架构（M 系列选 arm64，Intel 选 amd64）
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  FRP_ARCH="darwin_arm64"
else
  FRP_ARCH="darwin_amd64"
fi

FRP_VERSION="0.61.1"
FRP_DIR="frp_${FRP_VERSION}_${FRP_ARCH}"

echo "== 下载 frp $FRP_VERSION ($FRP_ARCH) =="
if [ ! -f "$FRP_DIR/frpc" ]; then
  curl -fL "https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/${FRP_DIR}.tar.gz" -o /tmp/frp.tar.gz
  tar -xzf /tmp/frp.tar.gz
  rm -f /tmp/frp.tar.gz
fi

# 生成本机 frpc.toml
sed "s/YOUR_SERVER_IP/${SERVER_IP}/" frpc.toml > /tmp/frpc.toml

echo "== 启动 frpc（Ctrl+C 停止）=="
"$FRP_DIR/frpc" -c /tmp/frpc.toml
