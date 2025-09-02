# 前后端集成测试指南

## 测试准备

### 1. 启动后端服务

```bash
cd /Users/qingyuan/qingyuaner/mahjong-backend
# 确保数据库迁移已执行
./admin_backend
```

### 2. 插入测试管理员用户

```sql
-- 连接到数据库，执行以下SQL
INSERT INTO admin_users (phone, username, role, status, created_at, updated_at)
VALUES
    ('13800138000', 'admin', 'admin', 'active', NOW(), NOW()),
    ('13800138001', 'super_admin', 'super_admin', 'active', NOW(), NOW())
ON CONFLICT (phone) DO NOTHING;
```

### 3. 启动前端服务

```bash
cd /Users/qingyuan/qingyuaner/vue-vben-admin/apps/web-antd
pnpm dev
```

## 测试步骤

### 1. 访问登录页面

- 打开浏览器访问：http://localhost:5173/login
- 确认页面显示手机号和验证码输入框

### 2. 测试发送验证码

- 输入手机号：13800138000
- 点击"发送验证码"按钮
- 检查：
  - 按钮变为"发送中..."状态
  - 成功后显示倒计时"60s"
  - 浏览器控制台无错误
  - 后端日志显示验证码发送成功

### 3. 测试登录

- 输入验证码：1234（如果配置了白名单）
- 点击"登录"按钮
- 检查：
  - 登录成功后跳转到仪表板
  - 右上角显示用户信息
  - 浏览器控制台无错误
  - 后端日志显示登录成功

### 4. 测试权限验证

- 访问需要认证的页面
- 检查 JWT token 是否正确传递
- 验证用户信息是否正确显示

## 可能的问题和解决方案

### 1. CORS 问题

如果遇到跨域问题，检查后端 CORS 配置：

```go
// 在 admin_backend/server/http.go 中
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:5173"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"*"},
    AllowCredentials: true,
}))
```

### 2. API 路径问题

确认前端 API 调用路径与后端路由匹配：

- 发送验证码：POST /api/admin/auth/send-code
- 登录：POST /api/admin/auth/login
- 获取用户信息：GET /api/admin/auth/me

### 3. 数据格式问题

检查前后端数据格式是否一致：

- 请求参数名称
- 响应数据结构
- 错误处理格式

### 4. 验证码问题

如果验证码验证失败：

- 检查是否配置了白名单
- 确认验证码是否过期
- 查看后端日志了解具体错误

## 调试技巧

### 1. 前端调试

- 打开浏览器开发者工具
- 查看 Network 标签页的 API 请求
- 检查 Console 标签页的错误信息

### 2. 后端调试

- 查看后端服务日志
- 使用 curl 直接测试 API
- 检查数据库中的数据

### 3. 网络调试

```bash
# 测试后端服务是否正常
curl -X POST http://localhost:8001/api/admin/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "13800138000"}'
```

## 成功标准

✅ 前端页面正常显示手机号+验证码登录表单 ✅ 发送验证码功能正常工作 ✅ 验证码登录成功并跳转到仪表板 ✅ 用户信息正确显示 ✅ JWT token 正确传递和验证 ✅ 前后端无错误日志
