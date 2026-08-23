FROM node:20-alpine AS base

WORKDIR /app

# 依赖安装阶段
FROM base AS deps
COPY package*.json ./
# 项目暂无 package-lock.json，用 npm install；若本地已生成 lock 可改回 npm ci
RUN npm install

# 构建阶段
FROM deps AS builder
COPY . .
RUN npm run build

# 生产镜像
FROM base AS production
RUN apk add --no-cache dumb-init

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/app/globals.css ./

EXPOSE 3000

CMD ["sh", "-c", "dumb-init node server.js"]
