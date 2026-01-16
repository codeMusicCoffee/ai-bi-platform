# ============================================
# AI-BI Frontend Dockerfile
# Next.js 静态导出 + Nginx 托管
# ============================================
# 使用前请先在本地执行: pnpm run build
# 确保 out 目录存在

FROM nginx:alpine

# 复制静态文件到 Nginx 目录
COPY out /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
