# 阶段1: 构建应用
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 设置构建参数，默认为test环境
ARG ENV_FILE=.env.test

# 复制package.json和yarn.lock
COPY package.json yarn.lock* package-lock.json* ./

# 安装依赖
RUN npm ci || yarn install --frozen-lockfile

# 复制源代码，但不包括.env文件
COPY . .

# 复制指定的环境文件为.env
COPY ${ENV_FILE} .env

# 构建应用
RUN npm run build

# 阶段2: 生产环境
FROM nginx:alpine

# 复制nginx配置
COPY --from=build /app/build /usr/share/nginx/html

# 添加自定义nginx配置以支持单页应用路由
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 