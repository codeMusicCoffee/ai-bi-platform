# syntax=docker/dockerfile:1

# ============================================
# AI-BI Frontend Dockerfile
# Next.js + npm 包管理器
# ============================================

FROM node:20-alpine AS base

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ============================================
# 依赖安装阶段
# ============================================
FROM base AS deps

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# ============================================
# 构建阶段
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置生产环境变量
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# 构建应用
RUN npm run build

# ============================================
# 生产阶段
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动命令
CMD ["node", "server.js"]
