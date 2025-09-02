FROM node:22-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

# 设置构建时环境变量
ENV VITE_GLOB_API_URL=/api
ENV VITE_APP_TITLE="AI记牌器管理后台"
ENV VITE_BASE=/
ENV VITE_COMPRESS=gzip
ENV VITE_PWA=false
ENV VITE_ARCHIVER=false
ENV VITE_INJECT_APP_LOADING=true

RUN npm i -g corepack

WORKDIR /app

# 复制 package 文件和 workspace 配置
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc ./

# 复制所有必要的配置文件
COPY internal ./internal
COPY packages ./packages
COPY scripts ./scripts
COPY apps/web-antd ./apps/web-antd

# 安装依赖
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 构建应用
RUN pnpm run build:antd

# 验证构建产物
RUN ls -la /app/apps/web-antd/dist/ && \
    ls -la /app/apps/web-antd/dist/_app.config.js || echo "No _app.config.js found" && \
    find /app/apps/web-antd/dist -name "*.js" | head -10

FROM nginx:stable-alpine AS production

# 安装必要工具
RUN apk add --no-cache gettext

# 配置 nginx 支持现代 JS 文件类型
RUN echo 'application/javascript mjs;' > /etc/nginx/conf.d/mjs.conf && \
    rm -rf /etc/nginx/conf.d/default.conf

# 拷贝构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 创建 nginx 配置模板
RUN printf "\
worker_processes auto;\n\
error_log /var/log/nginx/error.log warn;\n\
pid /var/run/nginx.pid;\n\
\n\
events {\n\
    worker_connections 1024;\n\
    use epoll;\n\
    multi_accept on;\n\
}\n\
\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    \n\
    log_format main '\$remote_addr - \$remote_user [\$time_local] \"\$request\" '\n\
                    '\$status \$body_bytes_sent \"\$http_referer\" '\n\
                    '\"\$http_user_agent\" \"\$http_x_forwarded_for\"';\n\
    \n\
    access_log /var/log/nginx/access.log main;\n\
    \n\
    sendfile on;\n\
    tcp_nopush on;\n\
    tcp_nodelay on;\n\
    keepalive_timeout 65;\n\
    keepalive_requests 100;\n\
    types_hash_max_size 2048;\n\
    client_max_body_size 16M;\n\
    client_body_timeout 300s;\n\
    client_header_timeout 300s;\n\
    send_timeout 300s;\n\
    reset_timedout_connection on;\n\
    \n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_proxied any;\n\
    gzip_comp_level 6;\n\
    gzip_types\n\
        text/plain\n\
        text/css\n\
        text/xml\n\
        text/javascript\n\
        application/javascript\n\
        application/xml+rss\n\
        application/json;\n\
    \n\
    server {\n\
        listen 8080;\n\
        server_name _;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        \n\
        add_header X-Frame-Options \"SAMEORIGIN\" always;\n\
        add_header X-Content-Type-Options \"nosniff\" always;\n\
        add_header X-XSS-Protection \"1; mode=block\" always;\n\
        add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n\
        \n\
        # _app.config.js 特殊处理 - 必须放在通用 js 规则之前\n\
        location ~ ^/_app\\.config\\.js(\\?.*)?$ {\n\
            expires -1;\n\
            add_header Cache-Control \"no-cache, no-store, must-revalidate\";\n\
            add_header Pragma \"no-cache\";\n\
            try_files \$uri =404;\n\
        }\n\
        \n\
        location ~* \\.(js|mjs)\$ {\n\
            expires 1y;\n\
            add_header Cache-Control \"public, immutable\";\n\
            add_header X-Content-Type-Options \"nosniff\";\n\
            add_header Access-Control-Allow-Origin \"*\";\n\
            try_files \$uri =404;\n\
            \n\
            # 优化大文件传输\n\
            sendfile on;\n\
            tcp_nopush on;\n\
            tcp_nodelay on;\n\
        }\n\
        \n\
        location ~* \\.(css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {\n\
            expires 1y;\n\
            add_header Cache-Control \"public, immutable\";\n\
            add_header X-Content-Type-Options \"nosniff\";\n\
            try_files \$uri =404;\n\
        }\n\
        \n\
        location ^~ /api/ {\n\
            proxy_pass \${BACKEND_URL};\n\
            proxy_set_header Host \$host;\n\
            proxy_set_header X-Real-IP \$remote_addr;\n\
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
            proxy_set_header X-Forwarded-Proto \$scheme;\n\
            proxy_http_version 1.1;\n\
            proxy_set_header Connection \"\";\n\
            proxy_buffering off;\n\
            proxy_redirect off;\n\
            \n\
            proxy_connect_timeout 300s;\n\
            proxy_send_timeout 300s;\n\
            proxy_read_timeout 300s;\n\
        }\n\
        \n\
        location / {\n\
            try_files \$uri \$uri/ @fallback;\n\
        }\n\
        \n\
        location @fallback {\n\
            rewrite ^.*\$ /index.html last;\n\
        }\n\
        \n\
        location /health {\n\
            access_log off;\n\
            return 200 \"healthy\\n\";\n\
            add_header Content-Type text/plain;\n\
        }\n\
    }\n\
}\n" > /etc/nginx/nginx.conf.template

# 创建启动脚本
RUN printf "\
#!/bin/sh\n\
set -e\n\
\n\
: \${BACKEND_URL:=http://admin-backend:8001}\n\
: \${VITE_GLOB_API_URL:=/api}\n\
\n\
echo \"Setting up configuration...\"\n\
echo \"BACKEND_URL: \$BACKEND_URL\"\n\
echo \"VITE_GLOB_API_URL: \$VITE_GLOB_API_URL\"\n\
\n\
envsubst '\${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
\n\
if [ -f \"/usr/share/nginx/html/_app.config.js\" ]; then\n\
    echo \"Updating _app.config.js with runtime config...\"\n\
    cp /usr/share/nginx/html/_app.config.js /usr/share/nginx/html/_app.config.js.bak\n\
    sed -i \"s|\\\"VITE_GLOB_API_URL\\\":\\\"[^\\\"]*\\\"|\\\"VITE_GLOB_API_URL\\\":\\\"\$VITE_GLOB_API_URL\\\"|g\" /usr/share/nginx/html/_app.config.js\n\
    echo \"Updated _app.config.js:\"\n\
    head -n 5 /usr/share/nginx/html/_app.config.js\n\
else\n\
    echo \"Warning: _app.config.js not found, creating minimal version...\"\n\
    printf \"window._VBEN_ADMIN_PRO_APP_CONF_ = {\\n  \\\"VITE_GLOB_API_URL\\\": \\\"\$VITE_GLOB_API_URL\\\"\\n};\\nObject.freeze(window._VBEN_ADMIN_PRO_APP_CONF_);\\nObject.defineProperty(window, \\\"_VBEN_ADMIN_PRO_APP_CONF_\\\", { configurable: false, writable: false });\" > /usr/share/nginx/html/_app.config.js\n\
fi\n\
\n\
echo \"Configuration setup completed.\"\n" > /docker-entrypoint.d/40-setup-config.sh

RUN chmod +x /docker-entrypoint.d/40-setup-config.sh

# 设置默认环境变量
ENV BACKEND_URL=http://admin-backend:8001
ENV VITE_GLOB_API_URL=/api

EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

