# 登录跳转问题修复

## 问题分析

### 原始问题

前端调用 login 接口登录成功，后端返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "admin_user_id": 1,
      "phone": "15606160125",
      "role": "admin",
      "status": "active",
      "username": "青源"
    }
  }
}
```

但是前端没有自动跳转，没有反应。

### 根本原因

1. **API 客户端不一致**: `loginApi` 使用了 `baseRequestClient` 而不是 `requestClient`
2. **响应数据处理**: `baseRequestClient` 返回完整响应，而 `requestClient` 自动提取 `data` 字段
3. **前端代码期望**: auth store 中的代码期望直接从 `result` 获取 `token` 和 `user`，但实际收到的是完整响应对象

### 修复方案

#### 1. 修改 loginApi 使用 requestClient

```typescript
// 修改前
export async function loginApi(data: AuthApi.LoginParams) {
  return baseRequestClient.post<AuthApi.LoginResult>('/admin/auth/login', data);
}

// 修改后
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/admin/auth/login', data);
}
```

#### 2. 修改 sendSMSCodeApi 的响应处理

```typescript
// 修改前
const result = await sendSMSCodeApi({ phone_number: phoneNumber });
description: result.message || '请查收短信验证码',

// 修改后
const response = await sendSMSCodeApi({ phone_number: phoneNumber });
description: response.data?.message || '请查收短信验证码',
```

### 客户端配置差异

#### requestClient (自动提取 data)

```typescript
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data', // 自动返回 response.data
});

// 配置了响应拦截器
client.addResponseInterceptor(
  defaultResponseInterceptor({
    codeField: 'code',
    dataField: 'data',
    successCode: 0,
  }),
);
```

#### baseRequestClient (返回完整响应)

```typescript
export const baseRequestClient = new RequestClient({ baseURL: apiURL });
// 没有配置 responseReturn: 'data'
// 返回完整的响应对象 { code, message, data }
```

### 使用场景

- **requestClient**: 需要认证的接口，自动添加 Authorization 头，自动提取 data
- **baseRequestClient**: 不需要认证的接口，返回完整响应

### 修复后的数据流

1. **发送验证码**: `baseRequestClient` → 完整响应 → 访问 `response.data.message`
2. **登录**: `requestClient` → 自动提取 data → 直接访问 `result.token` 和 `result.user`
3. **获取用户信息**: `requestClient` → 自动提取 data → 直接访问用户数据

## 测试验证

### 1. 检查登录流程

```bash
# 启动前端
cd /Users/qingyuan/qingyuaner/vue-vben-admin/apps/web-antd
pnpm dev

# 访问 http://localhost:5173/login
# 输入手机号: 15606160125
# 发送验证码
# 输入验证码: 1234
# 点击登录
```

### 2. 预期结果

- ✅ 登录成功后自动跳转到 `/dashboard/analytics`
- ✅ 显示登录成功通知
- ✅ 用户信息正确设置
- ✅ JWT token 正确保存

### 3. 调试检查点

- 浏览器控制台无错误
- Network 标签显示 login 接口返回 200
- localStorage 中保存了 access_token
- 用户信息正确显示在右上角

## 相关文件修改

1. `/apps/web-antd/src/api/core/auth.ts` - 修改 loginApi 使用 requestClient
2. `/apps/web-antd/src/store/auth.ts` - 修改 sendSMSCode 响应处理

## 注意事项

- 发送验证码接口保持使用 `baseRequestClient`，因为不需要认证
- 登录接口改用 `requestClient`，虽然登录时还没有 token，但 requestClient 会优雅处理空 token
- 其他需要认证的接口继续使用 `requestClient`
