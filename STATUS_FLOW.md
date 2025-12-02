# 代理审核状态流转说明

## 状态定义

| 状态 | 说明 | 对应页面 |
| --- | --- | --- |
| `not_submitted` | 新注册用户，尚未提交申请 | `/apply/personal` 或 `/apply/company` |
| `pending` | 已提交申请，等待审核 | `/result/success` |
| `reject` | 审核拒绝 | `/result/fail` |
| `active` / `pass` | 审核通过，账号激活 | `/agent/home` |

## 完整流转逻辑

### 1. 登录后（Login.vue）

```typescript
// 登录成功后检查状态，根据 senior_id 决定跳转
if (senior_id存在且有效) {
  router.push('/invite-entry'); // 邀请链接进入页面
} else {
  const status = await getStatusApi();

  if (status === 'not_submitted') {
    router.push('/apply/personal'); // 去填写申请表
  } else if (status === 'pending') {
    router.push('/result/success'); // 去等待审核页面
  } else if (status === 'reject') {
    router.push('/result/fail'); // 去拒绝页面
  } else if (status === 'active' || status === 'pass') {
    router.push('/agent/home'); // 去代理主页 ✅
  }
}
```

### 2. 申请页面（ApplyPersonal.vue / ApplyCompany.vue）

**访问时检查**（路由守卫）：

```typescript
if (to.meta.requiresStatusCheck) {
  const status = await getStatusApi();

  if (status === 'pending') {
    next('/result/success'); // 已提交 -> 成功页
  } else if (status === 'reject') {
    next('/result/fail'); // 被拒绝 -> 拒绝页
  } else if (status === 'active' || status === 'pass') {
    next('/agent/home'); // 已通过 -> 代理主页 ✅
  } else {
    next(); // not_submitted -> 允许访问
  }
}
```

**提交申请后**：

```typescript
await submitInfoApi(data);
// 提交成功后，后端自动将状态设为 pending
router.push('/result/success');
```

### 3. 提交成功页面（ResultSuccess.vue）

**每次进入/刷新时检查**：

```typescript
onMounted(async () => {
  const status = await getStatusApi();

  if (status === 'active' || status === 'pass') {
    router.replace('/agent/home'); // 审核通过 -> 代理主页 ✅
  } else if (status === 'reject') {
    router.replace('/result/fail'); // 被拒绝 -> 拒绝页
  } else if (status === 'not_submitted') {
    router.replace('/apply/personal'); // 异常状态 -> 重新申请
  }
  // pending -> 留在当前页面
});
```

### 4. 审核拒绝页面（ResultFail.vue）

**每次进入/刷新时检查**：

```typescript
onMounted(async () => {
  const status = await getStatusApi();

  if (status === 'active' || status === 'pass') {
    router.replace('/agent/home'); // 审核通过 -> 代理主页 ✅
  } else if (status === 'pending') {
    router.replace('/result/success'); // 重新审核中 -> 成功页
  } else if (status === 'not_submitted') {
    router.replace('/apply/personal'); // 异常状态 -> 重新申请
  }
  // reject -> 留在当前页面
});
```

### 5. 代理主页（AgentHome.vue）

**访问时检查**（路由守卫）：

```typescript
if (to.meta.requiresActive) {
  const status = await getStatusApi();

  if (status !== 'active' && status !== 'pass') {
    next('/apply/personal'); // 非active状态 -> 返回申请页
  } else {
    next(); // active -> 允许访问
  }
}
```

**页面内检查**：

```typescript
onMounted(async () => {
  await agent.loadPromoterInfo();

  if (agent.promoterInfo?.approval_status !== 'active') {
    router.replace('/apply/personal'); // 状态变化 -> 返回申请页
  }

  // 加载数据并启动轮询
  await loadAllData();
  startPolling();
});
```

## 状态变更时机

### 后端何时改变状态

1. **注册时**：
   - 状态设为 `not_submitted`
2. **提交申请时**（`POST /api/promoter/submit-info`）：
   - 正常申请：状态设为 `pending`
   - 邀请链接申请（有valid senior_id）：状态直接设为 `active`

3. **管理员审核时**：
   - 通过：状态设为 `active`
   - 拒绝：状态设为 `reject`

### 前端何时检查状态

1. **登录后**：立即检查并跳转
2. **访问申请页面时**：路由守卫检查
3. **访问result页面时**：`onMounted` 检查
4. **访问代理主页时**：路由守卫 + `onMounted` 双重检查

## 核心改进

### ✅ 之前的问题

- Result页面刷新后不会检查状态
- 如果管理员审核通过，用户刷新页面仍然停留在Result页面

### ✅ 现在的解决方案

- **ResultSuccess.vue**：每次 `onMounted` 检查状态，如果变为 `active` 自动跳转到 `/agent/home`
- **ResultFail.vue**：每次 `onMounted` 检查状态，如果变为 `active` 自动跳转到 `/agent/home`
- **所有状态检查都使用 `router.replace()` 避免返回按钮问题**

## 测试场景

### 场景1：正常申请流程

1. 用户注册 -> `not_submitted` -> 跳转到 `/apply/personal`
2. 填写申请表提交 -> `pending` -> 跳转到 `/result/success`
3. 用户刷新 `/result/success` -> 仍然是 `pending` -> 留在当前页
4. 管理员审核通过 -> 后端状态变为 `active`
5. 用户刷新 `/result/success` -> 检测到 `active` -> 自动跳转到 `/agent/home` ✅

### 场景2：邀请链接申请

1. 用户通过邀请链接登录 -> 跳转到 `/invite-entry`
2. 提交申请 -> 后端直接设为 `active` -> 跳转到 `/agent/home` ✅

### 场景3：审核被拒

1. 用户在 `/result/success` 等待
2. 管理员拒绝申请 -> 后端状态变为 `reject`
3. 用户刷新页面 -> 检测到 `reject` -> 自动跳转到 `/result/fail`
4. 用户在 `/result/fail` 页面
5. 管理员重新审核通过 -> 后端状态变为 `active`
6. 用户刷新 `/result/fail` -> 检测到 `active` -> 自动跳转到 `/agent/home` ✅

### 场景4：直接访问代理主页

1. 用户直接访问 `/agent/home`
2. 路由守卫检查状态
3. 如果不是 `active`，重定向到相应页面
4. 如果是 `active`，允许访问 ✅

## 关键代码位置

1. **路由守卫**：`/src/router/index.ts`
   - 申请页面状态检查
   - 代理主页权限检查

2. **Result页面状态检查**：
   - `/src/pages/ResultSuccess.vue` - `onMounted`
   - `/src/pages/ResultFail.vue` - `onMounted`

3. **登录后跳转**：`/src/pages/Login.vue`

4. **代理主页状态检查**：`/src/pages/AgentHome.vue`

## 注意事项

1. **使用 `router.replace()` 而非 `router.push()`**：避免用户点击返回按钮回到中间状态页面
2. **所有状态检查都要处理异常**：网络错误时优雅降级
3. **Result页面每次刷新都检查**：确保状态变化后立即响应
4. **路由守卫和页面内双重检查**：确保安全性
