# 部署到阿里云部署手册

## 架构

```
你的域名 (80/443)
      │
  阿里云 Nginx ──反代──▶ 127.0.0.1:3000
                             │
                   docker-compose（服务器）
                     ├─ web     Next.js 站点
                     ├─ chroma  向量数据库
                     └─ frps    内网穿透服务端 (7000)
                                  ▲ 隧道 (11435)
                                  │ 家里 Mac 主动连接
                          frpc + Ollama (127.0.0.1:11434)
```

- **服务器**（2核2G）：只跑 Next.js + Chroma + frps，不跑大模型
- **家里 Mac**：跑 Ollama + frpc，Mac 开机时把 Ollama 隧道映射到服务器的 `frps:11435`
- **Ollama 模型**：`qwen2.5:7b`（对话）+ `bge-m3`（向量），全部在家里 Mac 上

---

## 一、阿里云控制台准备

### 1. 安全组放行端口
在阿里云控制台 → ECS 实例 → 安全组 → 入方向规则，放行：

| 端口 | 用途 |
|------|------|
| 80 | HTTP（Nginx） |
| 443 | HTTPS（Nginx） |
| 7000 | frp 穿透控制端口（家里 Mac 连进来） |

### 2. 域名解析
到域名 DNS 服务商（阿里云云解析），添加 A 记录：
- 主机记录：`@` 和 `www`
- 记录值：你的服务器公网 IP

---

## 二、一键部署（本地 Mac 执行）

> 前提：本机已安装 Docker 并启动；服务器用 root 密码或 SSH 密钥可登录。
> 若服务器未装 docker，脚本会自动用阿里云镜像源安装（Alibaba Cloud Linux）。

```bash
cd /Users/csq/Desktop/personality/personal-site
chmod +x deploy/deploy.sh
./deploy/deploy.sh <服务器公网IP>
```

脚本会：本机构建镜像 → 打包成 tar → 上传服务器 → 服务器加载镜像并 `docker compose up -d`。
服务器 2G 内存构建会 OOM，所以**镜像必须在本地构建后上传**，这正是脚本干的事。

验证：`docker compose -f docker-compose.server.yml ps` 三个服务都 running/healthy。

---

## 三、家里 Mac 启动 frpc（Ollama 隧道）

> 前提：家里 Mac 的 Ollama 已启动，监听 `127.0.0.1:11434`。

```bash
cd /Users/csq/Desktop/personality/personal-site
chmod +x deploy/setup-frpc-mac.sh
./deploy/setup-frpc-mac.sh <服务器公网IP>
```

窗口保持打开（frpc 前台运行）。可以验证隧道是否通：

```bash
# 在服务器上执行，应返回 Ollama 的版本 JSON
curl http://127.0.0.1:11435/api/version
```

### 开机自启（可选）
Mac 设置 → 通用 → 登录项，把上面的启动命令做成 `.command` 脚本加进去，或写进 launchd。

---

## 四、配置 Nginx + HTTPS

### 1. 装 Nginx（服务器上执行）
```bash
dnf install -y nginx
```

### 2. 放置站点配置
`deploy/nginx-personal-site.conf` 已填好域名 `chensuipian0200.icu`，
传到服务器 `/etc/nginx/conf.d/personal-site.conf`，然后：
```bash
nginx -t && systemctl enable --now nginx
```

### 3. 申请 HTTPS 证书（域名已备案，可申请免费证书）
**方式 A：certbot（Let's Encrypt，免费自动续期）**
```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d chensuipian0200.icu -d www.chensuipian0200.icu
```

**方式 B：阿里云免费证书**
阿里云控制台 → 数字证书管理服务 → 免费证书 → 申请 → 下载 nginx 版 → 上传到服务器，
再在 `nginx-personal-site.conf` 里加 443 server 块并配置证书路径。

certbot 会自动把配置改成 HTTPS 并加跳转，推荐用方式 A。

---

## 五、最终验证

1. 浏览器访问 `https://你的域名`，能看到首页
2. 打开 `/chat`，问"介绍一下此项目的技术架构"，确认 SSE 流式输出 + mermaid 流程图正常
3. 打开 `/admin`，直贴内容一条，确认知识库可用

---

## 六、注意事项

- **知识库数据是全新的**：服务器上的 Chroma 是空库，之前在家里本地添加的文档不会自动同步。
  架构文档会自动种入（代码里做了幂等 seed），其他文档需要重新在 `/admin` 添加。
  如需要迁移，见下方"迁移知识库"。
- **家 Mac 关机则 AI 不可用**：网站能访问，但 Ollama 连不上，`/chat` 会提示"请启动电脑以使用ollama"。
- **重新部署**：以后改代码，重新执行 `./deploy/deploy.sh <IP>` 即可，Chroma 数据在服务器 volume 里会保留。
- **frp token**：在 `deploy/frps.toml` 和 `deploy/frpc.toml` 里，两边必须一致。默认已生成随机值。
- **2G 内存建议加 swap**：Chroma 比较吃内存，建议服务器加 2G 交换分区防 OOM：
  `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

---

## 附：迁移知识库（可选）

本地 Chroma 数据在 `personal-site/chroma-data`（docker volume `personal-site_chroma-data`）。
如需把本地已有文档迁到服务器：

```bash
# 本地导出
docker run --rm -v personal-site_chroma-data:/data -v $PWD:/backup alpine tar czf /backup/chroma-backup.tar.gz -C /data .
# 上传服务器后导入
docker run --rm -v personal-site_chroma-data:/data -v /root:/backup alpine tar xzf /backup/chroma-backup.tar.gz -C /data
```
（volume 名字以服务器上 `docker volume ls` 为准）
