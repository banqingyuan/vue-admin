# Vue Vben Admin 生产级 Docker 部署方案

## 概述

这是一个完整的生产级 Docker 部署方案，解决了以下关键问题：

1. **静态资源 404 问题**：正确处理 `_app.config.js` 和 `jse/` 目录下的 JS 文件
2. **动态配置**：支持运行时修改 API 地址，无需重新构建镜像
3. **反向代理**：所有 API 请求通过同域 `/api` 转发，避免跨域问题
4. **性能优化**：启用 Gzip 压缩、静态资源缓存、健康检查等

## 快速开始

### 1. 构建镜像

```bash
# 在 vue-vben-admin 根目录执行
docker build -f apps/web-antd/Dockerfile -t web-antd:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name web-antd \
  -p 8080:8080 \
  -e BACKEND_URL=http://admin-backend:8001 \
  -e VITE_GLOB_API_URL=/api \
  web-antd:latest
```

### 3. 使用 Docker Compose（推荐）

```bash
cd apps/web-antd
docker-compose up -d
```

## 环境变量配置

### 构建时环境变量

这些变量在构建阶段设置，影响最终的构建产物：

- `VITE_GLOB_API_URL`: API 基础路径（默认：`/api`）
- `VITE_APP_TITLE`: 应用标题（默认：`AI记牌器管理后台`）
- `VITE_BASE`: 应用基础路径（默认：`/`）
- `VITE_COMPRESS`: 压缩类型（默认：`gzip`）
- `VITE_PWA`: 是否启用 PWA（默认：`false`）
- `VITE_ARCHIVER`: 是否生成压缩包（默认：`false`）
- `VITE_INJECT_APP_LOADING`: 是否注入加载动画（默认：`true`）

### 运行时环境变量

这些变量在容器启动时设置，可以动态修改配置：

- `BACKEND_URL`: 后端服务地址（默认：`http://admin-backend:8001`）
- `VITE_GLOB_API_URL`: 前端 API 基础路径（默认：`/api`）

## 目录结构

```
/usr/share/nginx/html/
├── index.html                 # 主页面
├── _app.config.js            # 动态配置文件
├── css/                      # 样式文件
├── js/                       # 普通 JS 文件
├── jse/                      # 入口 JS 文件（特殊命名）
├── assets/                   # 静态资源
└── ...
```

## Nginx 配置特点

1. **静态资源缓存**：CSS/JS/图片等文件缓存 1 年
2. **配置文件不缓存**：`_app.config.js` 设置为不缓存，确保配置更新生效
3. **API 反向代理**：`/api/*` 请求转发到后端服务
4. **SPA 路由支持**：支持 Vue Router 的 history 模式
5. **安全头**：添加必要的安全响应头
6. **健康检查**：提供 `/health` 端点

## 故障排除

### 1. 静态资源 404

检查构建产物是否正确生成：

```bash
docker exec -it web-antd ls -la /usr/share/nginx/html/
docker exec -it web-antd find /usr/share/nginx/html -name "*.js" | head -10
```

### 2. \_app.config.js 404

检查配置文件是否存在和内容：

```bash
docker exec -it web-antd cat /usr/share/nginx/html/_app.config.js
```

### 3. API 请求失败

检查后端服务连接：

```bash
docker exec -it web-antd wget -qO- http://admin-backend:8001/health
```

### 4. 查看 Nginx 日志

```bash
docker logs web-antd
docker exec -it web-antd tail -f /var/log/nginx/access.log
docker exec -it web-antd tail -f /var/log/nginx/error.log
```

## 生产环境建议

1. **使用外部数据库**：不要在容器中运行数据库
2. **配置 HTTPS**：在负载均衡器或反向代理层配置 SSL
3. **监控和日志**：集成监控系统和日志收集
4. **资源限制**：设置适当的 CPU 和内存限制
5. **备份策略**：定期备份数据和配置

## 扩展配置

### 自定义 Nginx 配置

如需自定义 Nginx 配置，可以挂载配置文件：

```bash
docker run -d \
  --name web-antd \
  -p 8080:8080 \
  -v /path/to/your/nginx.conf:/etc/nginx/nginx.conf:ro \
  web-antd:latest
```

### 多环境部署

通过环境变量区分不同环境：

```bash
# 开发环境
docker run -d \
  -e BACKEND_URL=http://dev-backend:8001 \
  -e VITE_GLOB_API_URL=/api \
  web-antd:latest

# 生产环境
docker run -d \
  -e BACKEND_URL=http://prod-backend:8001 \
  -e VITE_GLOB_API_URL=/api \
  web-antd:latest
```
