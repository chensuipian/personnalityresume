# 部署脚本 for Windows
# 使用 PowerShell 运行

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  部署个人主页到阿里云" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 检查 Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 打包镜像
Write-Host "`n1. 构建并打包 Docker 镜像..." -ForegroundColor Green
docker build -t personal-site:latest .
docker save personal-site:latest -o personal-site.tar

# 上传到服务器
Write-Host "`n2. 上传到阿里云..." -ForegroundColor Green
$ServerIP = Read-Host "请输入阿里云服务器 IP"
$Password = Read-Host -assecurestring "请输入 root 密码"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# 使用 scp 上传（需要安装 scp 工具或使用 pscp）
Write-Host "请确保已安装 sshpass 或使用其他方式上传 personal-site.tar 到 /tmp/"
Write-Host "上传命令示例: scp personal-site.tar root@$ServerIP:/tmp/"

# 在服务器上执行部署
Write-Host "`n3. 在服务器上执行部署..." -ForegroundColor Green
$Commands = @"
    yum install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
    docker load -i /tmp/personal-site.tar
    mkdir -p /www/personal-site
    cd /www/personal-site
    cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  web:
    image: personal-site:latest
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - OLLAMA_BASE_URL=http://YOUR_LOCAL_IP:11434
      - LLM_MODEL=qwen2.5:7b
      - EMBEDDING_MODEL=nomic-embed-text
      - DOCS_FILE=/app/data/docs.json
    volumes:
      - docs-data:/app/data
    restart: unless-stopped
volumes:
  docs-data:
EOF
    docker-compose up -d
    echo '部署完成！访问 http://$ServerIP:3000'
"@

# 简化处理：提示用户手动执行
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "请在阿里云服务器上手动执行以下命令:" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host @"
# 1. 安装 Docker（如果还没有）
yum install -y docker.io docker-compose
systemctl start docker
systemctl enable docker

# 2. 加载镜像
docker load -i /tmp/personal-site.tar

# 3. 创建目录并启动
mkdir -p /www/personal-site
cd /www/personal-site

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  web:
    image: personal-site:latest
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - OLLAMA_BASE_URL=http://你的本地电脑IP:11434
      - LLM_MODEL=qwen2.5:7b
      - EMBEDDING_MODEL=nomic-embed-text
      - DOCS_FILE=/app/data/docs.json
    volumes:
      - docs-data:/app/data
    restart: unless-stopped
volumes:
  docs-data:
EOF

# 启动
docker-compose up -d
"@

# 清理
Remove-Item -Force personal-site.tar -ErrorAction SilentlyContinue

Write-Host "`n部署脚本完成！" -ForegroundColor Green
