# 登录后状态检查逻辑

## 概述

用户登录成功后，系统会自动检查其推广员申请状态，并根据不同状态跳转到相应页面。

## 后端接口

### 获取审核状态

- **接口**: `GET /api/promoter/status`
- **认证**: 需要JWT Token (Bearer)
- **角色要求**: promoter
- **返回**: 字符串类型的状态值

### 状态值说明

| 状态值      | 说明           | 前端行为                                |
| ----------- | -------------- | --------------------------------------- |
| `"pending"` | 未提交或待审核 | 跳转到 `/result/success` (提交成功页面) |
| `"reject"`  | 审核拒绝       | 跳转到 `/result/fail` (审核拒绝页面)    |
| `"pass"`    | 审核通过       | 跳转到主应用 (暂时跳转到成功页面)       |
| 其他/未知   | 异常状态       | 跳转到 `/apply/personal` (申请页面)     |

### 后端状态映射逻辑

后端会将数据库中的多种状态值统一映射为三种标准状态：

```go
// approved, pass, passed, active → "pass"
// rejected, reject → "reject"
// 其他所有状态（包括未创建记录） → "pending"
```

## 前端实现

### 登录流程

```typescript
async function onSubmit() {
  // 1. 验证表单
  if (!canSubmit.value) return;

  try {
    // 2. 调用登录接口
    const data = await loginApi({
      phone_number: phone.value,
      code: code.value,
      allow_register_role: 'promoter',
    });

    // 3. 保存Token和用户信息
    auth.setToken(data.token);
    auth.setUser(data.user);

    // 4. 检查申请状态
    try {
      const statusResponse = await getStatusApi();
      const status = statusResponse.data;

      // 5. 根据状态跳转
      if (status === 'pending') {
        router.replace('/result/success'); // 提交成功页面
      } else if (status === 'reject') {
        router.replace('/result/fail'); // 审核拒绝页面
      } else if (status === 'pass') {
        toast.success('审核已通过');
        router.replace('/result/success'); // TODO: 改为主应用页面
      } else {
        router.replace('/apply/personal'); // 申请页面
      }
    } catch (statusError) {
      // 状态获取失败，默认跳转到申请页面
      console.error('获取状态失败:', statusError);
      router.replace('/apply/personal');
    }
  } catch (error: any) {
    // 登录失败
    const errorMessage = error?.response?.data?.message || '登录失败';
    toast.error(errorMessage);
  }
}
```

### API定义

```typescript
// src/api/promoter.ts
export function getStatusApi() {
  return request<string>({
    method: 'GET',
    url: '/promoter/status',
  });
}
```

## 页面路由

| 路径              | 组件              | 说明         | 需要认证 |
| ----------------- | ----------------- | ------------ | -------- |
| `/login`          | Login.vue         | 登录页面     | ❌       |
| `/apply/personal` | ApplyPersonal.vue | 个人申请页面 | ✅       |
| `/apply/company`  | ApplyCompany.vue  | 企业申请页面 | ✅       |
| `/result/success` | ResultSuccess.vue | 提交成功页面 | ✅       |
| `/result/fail`    | ResultFail.vue    | 审核拒绝页面 | ✅       |

## 用户流程图

```
登录成功
  ↓
获取状态
  ↓
┌─────────────────┐
│  状态判断       │
├─────────────────┤
│ pending   → /result/success (提交成功，等待审核)
│ reject    → /result/fail    (审核拒绝，联系客服)
│ pass      → 主应用          (审核通过，进入系统)
│ 其他/错误 → /apply/personal (重新申请)
└─────────────────┘
```

## 注意事项

1. **Token保存**: 登录成功后立即保存Token，确保后续状态查询接口可以正常调用
2. **错误处理**: 状态查询失败时，默认跳转到申请页面，避免用户卡在某个页面
3. **路由保护**: 除登录页面外，其他所有页面都需要认证
4. **状态刷新**: 用户可以通过重新登录来刷新状态检查
5. **审核通过**: 当状态为 `pass` 时，应该跳转到主应用页面（当前暂时跳转到成功页面）

## 路由守卫 - 自动状态检查与重定向

### 功能说明

在用户访问 `apply/*` 页面时，系统会自动检查用户的申请状态，并根据状态进行重定向，防止用户重复提交或访问不应该访问的页面。

### 实现位置

`src/router/index.ts` - `router.beforeEach` 路由守卫

### 检查逻辑

```typescript
// 标记需要状态检查的路由
meta: {
  requiresStatusCheck: true;
}

// 在路由守卫中检查
if (to.meta.requiresStatusCheck && auth.token) {
  const status = await getStatusApi();

  // 根据状态重定向
  if (status === 'pending') {
    next('/result/success'); // 已提交，显示等待页面
  } else if (status === 'reject') {
    next('/result/fail'); // 已拒绝，显示拒绝页面
  } else if (status === 'pass') {
    // 已通过，允许访问或重定向到主应用
  }
  // 其他状态允许访问申请页面
}
```

### 路由配置

| 路径              | `requiresStatusCheck` | 说明                    |
| ----------------- | --------------------- | ----------------------- |
| `/apply/personal` | ✅                    | 个人申请页面 - 需要检查 |
| `/apply/company`  | ✅                    | 企业申请页面 - 需要检查 |
| `/confirm/*`      | ❌                    | 确认页面 - 无需检查     |
| `/result/*`       | ❌                    | 结果页面 - 无需检查     |

### 重定向规则

| 当前状态  | 尝试访问 `/apply/*` | 实际跳转          | 原因               |
| --------- | ------------------- | ----------------- | ------------------ |
| `pending` | `/apply/personal`   | `/result/success` | 已提交，等待审核   |
| `reject`  | `/apply/personal`   | `/result/fail`    | 已拒绝，需联系客服 |
| `pass`    | `/apply/personal`   | 允许访问          | 已通过（暂时允许） |
| 未知/错误 | `/apply/personal`   | 允许访问          | 允许提交申请       |

### 场景示例

**场景1：用户已提交申请，尝试再次提交**

```
用户访问 /apply/personal
  ↓
路由守卫检查状态
  ↓
status = "pending"
  ↓
自动重定向到 /result/success
  ↓
显示"申请已成功提交，等待审核"
```

**场景2：用户申请被拒绝，尝试重新申请**

```
用户访问 /apply/personal
  ↓
路由守卫检查状态
  ↓
status = "reject"
  ↓
自动重定向到 /result/fail
  ↓
显示"申请未通过，请联系客服"
```

**场景3：首次访问或审核通过**

```
用户访问 /apply/personal
  ↓
路由守卫检查状态
  ↓
status = null 或 "pass"
  ↓
允许访问申请页面
  ↓
用户可以填写/查看申请信息
```

### 错误处理

- 状态检查失败时不阻塞用户访问
- 记录错误日志到控制台
- 允许用户继续访问目标页面

## 未来优化

- [ ] 实现审核通过后的主应用页面
- [ ] 添加状态轮询机制（可选）
- [ ] 优化状态检查的加载体验（添加loading状态）
- [ ] 添加状态变更通知功能
- [ ] 为拒绝状态添加重新申请功能
