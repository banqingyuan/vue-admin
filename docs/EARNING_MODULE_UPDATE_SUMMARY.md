# Onboarding App Earnings 模块更新总结

## 更新时间
2025-11-26

## 需求背景

用户要求更新 onboarding app (promoter-onboarding-h5) 中的 earnings 模块的数据计算逻辑：

### 当前展示的三个指标
1. **总收益** - 显示代理的总收入
2. **待结算** - 显示尚未到可提现时间的收入
3. **可提现** - 显示当前可以提现的金额

### 新的计算逻辑
- **待结算** = pending 状态金额 - pending 状态同订单 id 的 refunded 金额
- **可提现金额** = withdrawable 金额 - withdrawable 对应的退款 - 已提现金额

## 实施方案

### 后端更新 ✅

**文件：** `/Users/qingyuan/qingyuaner/mahjong-backend/`

1. **Repository 层** (`internal/repository/promoter_performance.go`)
   - 新增接口方法：`SumRefundedForPendingByPromoterID`
   - 新增实现方法：查询 pending 订单对应的退款金额

2. **Service 层** (`internal/service/promoter_analytics_service.go`)
   - 更新 `GetWithdrawalBalance` 方法
   - 修改待结算的计算公式：从 `pending + withdrawable - 已提现 - 所有退款` 改为 `pending - pending对应的退款`

### 前端更新 ✅

**文件：** `/Users/qingyuan/qingyuaner/vue-vben-admin/apps/promoter-onboarding-h5/`

**结论：无需修改前端代码**

#### 原因分析

1. **组件直接使用 API 数据**
   - `EarningsCard.vue` 组件直接显示 `agent.withdrawalBalance` 中的数据
   - `WithdrawalPage.vue` 同样直接使用 store 中的数据
   - 没有在前端进行任何金额计算

2. **数据流**
```
后端 API (/promoter/withdrawal/balance)
    ↓
Store (useAgentStore.withdrawalBalance)
    ↓
组件展示 (EarningsCard.vue)
```

3. **组件代码分析**

```vue
<!-- EarningsCard.vue -->
<template>
  <div class="data-item">
    <p class="label">总收入(元)</p>
    <p class="value">{{ formatMoney(balance?.total_earnings_fen) }}</p>
  </div>
  
  <div class="data-item">
    <p class="label">待结算(元)</p>
    <p class="value">{{ formatMoney(balance?.pending_settlement_fen) }}</p>
  </div>
  
  <div class="data-item">
    <p class="label">可提现(元)</p>
    <p class="value">{{ formatMoney(balance?.withdrawable_fen) }}</p>
  </div>
</template>

<script setup lang="ts">
const balance = computed(() => agent.withdrawalBalance);

function formatMoney(fen?: number): string {
  if (fen === undefined || fen === null) return '0.00';
  return (fen / 100).toFixed(2);
}
</script>
```

**关键点**：
- 前端只负责格式化显示（分转元）
- 所有业务逻辑和金额计算都在后端完成
- API 接口结构未变，字段名称未变

## API 接口

### 接口信息
- **路径**：`GET /promoter/withdrawal/balance`
- **鉴权**：需要 Bearer Token

### 响应结构（无变化）
```typescript
interface WithdrawalBalance {
  total_earnings_fen: number;      // 总收益（分）
  withdrawn_fen: number;            // 已提现（分）
  pending_settlement_fen: number;   // 待结算（分）【计算逻辑更新】
  withdrawable_fen: number;         // 可提现（分）
}
```

## 测试验证

### 前端测试
1. 启动 H5 应用
2. 登录代理账号
3. 查看首页的 Earnings Card
4. 验证三个金额显示正确

### 后端测试
参考 `/Users/qingyuan/qingyuaner/mahjong-backend/docs/WITHDRAWAL_BALANCE_CALCULATION_UPDATE.md` 中的测试场景。

## 部署清单

### 后端
- [x] 更新代码
- [ ] 编译新版本
- [ ] 部署到服务器
- [ ] 验证 API 返回正确

### 前端
- [x] 确认无需修改
- [ ] 验证显示正常（部署后端后）

## 向后兼容性

✅ **完全兼容**
- 前端代码无需修改
- API 接口结构未变
- 仅后端计算逻辑更准确

## 相关组件

### H5 App 中使用余额信息的组件
1. `src/components/agent/EarningsCard.vue` - 首页收入卡片 ✅ 无需修改
2. `src/pages/WithdrawalPage.vue` - 提现页面 ✅ 无需修改
3. `src/pages/AgentHome.vue` - 代理首页 ✅ 无需修改

### Store
- `src/store/agent.ts` - 代理信息 store ✅ 无需修改
  - `loadWithdrawalBalance()` 方法直接调用 API

### API
- `src/api/agent.ts` - API 接口定义 ✅ 无需修改
  - `getWithdrawalBalanceApi()` 方法
  - `WithdrawalBalance` 类型定义

## 总结

此次更新**仅涉及后端**，前端完全不需要修改。这是因为：

1. **良好的架构设计**：前端仅负责展示，业务逻辑在后端
2. **接口稳定性**：API 接口结构保持不变
3. **单向数据流**：数据从后端流向前端，前端不做计算

这种设计使得业务逻辑的调整可以完全在后端完成，大大提高了系统的可维护性。

## 后续工作

1. ✅ 后端代码更新完成
2. ⏳ 等待后端部署
3. ⏳ 部署后进行端到端测试
4. ⏳ 监控生产环境数据准确性

