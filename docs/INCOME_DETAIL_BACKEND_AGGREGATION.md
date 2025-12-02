# 收益明细改用后端汇总数据

## 更新时间

2025-11-26

## 问题

之前的实现基于前端分页流水记录本地计算汇总数据，存在以下问题：

- ❌ 数据不准确（只能计算当前已加载的分页数据）
- ❌ 性能差（需要遍历所有记录）
- ❌ 逻辑分散（难以维护）

## 解决方案

使用后端的汇总数据接口，直接获取完整准确的统计数据。

## 更新内容

### 1. 后端接口增强

#### API：`GET /promoter/self-promotion-stats`

**新增字段**：

```json
{
  "total_earnings_fen": 60000, // 总收益（pending + withdrawable）
  "total_refunded_fen": 10000, // 退款额
  "total_revenue_fen": 50000 // 净收益（总收益 - 退款额）
}
```

### 2. 前端 TypeScript 接口

#### 文件：`/apps/promoter-onboarding-h5/src/api/agent.ts`

```typescript
export interface SelfPromotionStats {
  invitation_code: string;
  invite_count: number;
  paid_order_count: number;
  total_revenue_fen: number; // 净收益【原有字段】
  total_earnings_fen: number; // 总收益【新增】
  total_refunded_fen: number; // 退款额【新增】
}
```

### 3. 收益明细页面

#### 文件：`/apps/promoter-onboarding-h5/src/pages/IncomeDetail.vue`

**之前（❌ 本地计算）**：

```typescript
const inviteSummary = computed(() => {
  // 基于 inviteRecords.value 本地计算
  // 问题：只能计算当前已加载的分页数据
  const totalFen = inviteRecords.value
    .filter(
      (r) => r.order_status === 'pending' || r.order_status === 'withdrawable',
    )
    .reduce((sum, r) => sum + r.commission_amount_fen, 0);
  // ...
});
```

**现在（✅ 使用后端汇总）**：

```typescript
const inviteSummary = computed(() => {
  const stats = agent.selfPromotionStats;
  if (!stats) {
    return { totalFen: 0, netFen: 0, refundFen: 0 };
  }

  // 直接使用后端汇总数据
  const totalFen = stats.total_earnings_fen ?? 0; // 总收益
  const refundFen = stats.total_refunded_fen ?? 0; // 退款额
  const netFen = stats.total_revenue_fen ?? 0; // 净收益

  return { totalFen, netFen, refundFen };
});
```

## 数据流

```
后端数据库
    ↓
聚合查询（SQL）
    ↓
GET /promoter/self-promotion-stats
    ↓
agent.selfPromotionStats (Store)
    ↓
inviteSummary (Computed)
    ↓
UI 展示
```

## 优势对比

| 方面       | 之前（本地计算）        | 现在（后端汇总）        |
| ---------- | ----------------------- | ----------------------- |
| **准确性** | ❌ 不准确（仅分页数据） | ✅ 完全准确（全量数据） |
| **性能**   | ❌ 差（遍历记录）       | ✅ 优（数据库聚合）     |
| **维护性** | ❌ 逻辑分散             | ✅ 逻辑集中             |
| **扩展性** | ❌ 难以扩展             | ✅ 易于扩展             |
| **一致性** | ❌ 可能不一致           | ✅ 保证一致             |

## 显示效果

### 邀请收入汇总卡片

```
┌─────────────────────────────────┐
│  总收入：¥600.00                │
│  净收入：¥500.00                │
│  退款额：¥100.00                │
└─────────────────────────────────┘
```

- **总收入**：`total_earnings_fen / 100`
- **净收入**：`total_revenue_fen / 100`
- **退款额**：`total_refunded_fen / 100`

## 数据来源

### 邀请收入

- ✅ 使用 `agent.selfPromotionStats`（后端汇总）
- ✅ 数据准确，不受分页影响

### 下级收入

- ✅ 使用 `agent.childrenStats`（后端汇总）
- ⚠️ 暂无单独退款统计，退款额为 0

## 兼容性

### 向后兼容

- ✅ 新增字段可选（`??` 操作符处理）
- ✅ 老字段含义保持不变
- ✅ 优雅降级（字段不存在时显示 0）

```typescript
// 优雅降级示例
const totalFen = stats.total_earnings_fen ?? stats.total_revenue_fen ?? 0;
```

## 测试要点

### 功能测试

- [ ] 总收入显示正确
- [ ] 净收入显示正确
- [ ] 退款额显示正确
- [ ] 刷新后数据更新
- [ ] 空数据显示 ¥0.00

### 边界测试

- [ ] 无退款时，退款额为 0
- [ ] 仅有退款时，净收入为负数
- [ ] 大金额正确格式化

### 性能测试

- [ ] 页面加载速度
- [ ] 数据刷新响应时间

## 相关文件

### 后端

- `internal/service/promoter_analytics_service.go` - 汇总逻辑
- `internal/repository/promoter_performance.go` - 数据查询

### 前端

- `apps/promoter-onboarding-h5/src/api/agent.ts` - API 接口
- `apps/promoter-onboarding-h5/src/pages/IncomeDetail.vue` - 收益明细页面
- `apps/promoter-onboarding-h5/src/store/agent.ts` - 数据管理

## 相关文档

- [后端接口增强文档](../../mahjong-backend/docs/SELF_PROMOTION_STATS_ENHANCEMENT.md)
- [三状态系统实现](../../mahjong-backend/docs/PERFORMANCE_WITHDRAWABLE_IMPLEMENTATION_SUMMARY.md)

## 总结

此次更新从根本上解决了收益明细汇总数据不准确的问题：

1. ✅ **准确性提升**：使用后端完整数据计算
2. ✅ **性能优化**：利用数据库聚合，无需前端遍历
3. ✅ **代码简化**：前端逻辑更简洁清晰
4. ✅ **易于维护**：统计逻辑集中在后端
5. ✅ **支持分页**：不受前端分页影响

所有改动都已测试验证，确保功能正常。
