# Production Image
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from local build
# Note: User must run 'npm run build' locally first to generate 'out' directory
COPY out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
