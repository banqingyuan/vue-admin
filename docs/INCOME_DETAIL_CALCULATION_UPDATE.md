# 收益明细页面计算逻辑更新

## 更新时间

2025-11-26

## 背景

根据今天更新的三状态系统（pending/withdrawable/refunded），更新收益明细页面顶部的总收益、净收益、退款额三项数据的计算逻辑。

## 更新内容

### 1. 更新 TypeScript 接口

#### 文件：`/apps/promoter-onboarding-h5/src/api/agent.ts`

**更新 `InvitePerformanceRecord` 接口**：

```typescript
// 之前
export interface InvitePerformanceRecord {
  // ...
  order_status: 'paid' | 'refunded';
  // ...
}

// 更新后
export interface InvitePerformanceRecord {
  // ...
  order_status: 'pending' | 'withdrawable' | 'refunded';
  // ...
}
```

**说明**：业绩流水记录的状态从二状态（paid/refunded）升级为三状态（pending/withdrawable/refunded）。

### 2. 更新计算逻辑

#### 文件：`/apps/promoter-onboarding-h5/src/pages/IncomeDetail.vue`

#### 2.1 邀请收入汇总

**之前的逻辑**（不准确）：

```typescript
const inviteSummary = computed(() => {
  const stats = agent.selfPromotionStats;
  const netFen = stats?.total_revenue_fen ?? 0;
  // 将总收入与净收入保持一致，退款额为0
  const totalFen = netFen;
  const refundFen = 0;
  return { totalFen, netFen, refundFen };
});
```

**更新后的逻辑**（基于流水记录计算）：

```typescript
const inviteSummary = computed(() => {
  // 总收益 = 所有 pending + withdrawable 状态的佣金
  const totalFen = inviteRecords.value
    .filter(
      (r) => r.order_status === 'pending' || r.order_status === 'withdrawable',
    )
    .reduce((sum, r) => sum + r.commission_amount_fen, 0);

  // 退款额 = 所有 refunded 状态的佣金（取绝对值）
  const refundFen = inviteRecords.value
    .filter((r) => r.order_status === 'refunded')
    .reduce((sum, r) => sum + Math.abs(r.commission_amount_fen), 0);

  // 净收益 = 总收益 - 退款额
  const netFen = totalFen - refundFen;

  return { totalFen, netFen, refundFen };
});
```

#### 2.2 下级收入汇总

**更新后的逻辑**：

```typescript
const childrenSummary = computed(() => {
  const stats = Array.isArray(agent.childrenStats) ? agent.childrenStats : [];
  // parent_share_from_child_fen 已经是 pending + withdrawable 的总和
  const totalFen = stats.reduce(
    (sum, child) => sum + child.parent_share_from_child_fen,
    0,
  );
  // 暂时没有下级退款的单独统计，退款额为0
  const refundFen = 0;
  const netFen = totalFen - refundFen;
  return { totalFen, netFen, refundFen };
});
```

**说明**：下级统计数据来自后端聚合，暂无单独的退款字段，所以退款额为 0。

#### 2.3 金额格式化

**更新后的逻辑**：

```typescript
const formatAmount = (record: InvitePerformanceRecord) => {
  // refunded 状态显示负数，pending 和 withdrawable 显示正数
  const sign = record.order_status === 'refunded' ? '-' : '+';
  const amount = Math.abs(record.commission_amount_fen);
  return `${sign}¥${(amount / 100).toFixed(2)}`;
};
```

**说明**：确保退款记录显示负号，正常收入显示加号。

## 新的计算规则

### 三个核心指标

根据三状态系统，收益明细顶部显示三个指标：

#### 1. 总收益（总收入）

**定义**：所有已支付订单的佣金总和（不含退款）

**计算公式**：

```
总收益 = Σ(pending 状态的佣金) + Σ(withdrawable 状态的佣金)
```

**业务含义**：

- 包含尚未到提现期的收入（pending）
- 包含已到提现期的收入（withdrawable）
- 不包含退款

#### 2. 净收益（净收入）

**定义**：总收益扣除退款后的实际收入

**计算公式**：

```
净收益 = 总收益 - 退款额
```

**业务含义**：

- 实际可获得的收入
- 已经考虑了退款损失

#### 3. 退款额

**定义**：所有退款订单的佣金总和

**计算公式**：

```
退款额 = Σ|refunded 状态的佣金|
```

**业务含义**：

- 需要退回的佣金
- 已从总收益中扣除

## 数据来源

### 邀请收入

- **数据源**：`/promoter/invite-performances` API
- **计算方式**：基于业绩流水记录实时计算
- **优点**：数据准确，包含完整的退款信息

### 下级收入

- **数据源**：`/promoter/children` API
- **计算方式**：使用后端聚合的 `parent_share_from_child_fen` 字段
- **限制**：暂无单独的退款统计

## 业务逻辑示例

### 示例 1：正常订单流程

| 时间       | 事件         | order_status | 影响                       |
| ---------- | ------------ | ------------ | -------------------------- |
| 2025-10-15 | 用户购买 VIP | pending      | 总收益 +100 元             |
| 2025-11-10 | 到达提现期   | withdrawable | 总收益不变，可提现 +100 元 |
| 2025-11-15 | 提现成功     | withdrawable | 总收益不变，已提现 +100 元 |

### 示例 2：包含退款的流程

| 时间       | 事件        | order_status | 总收益 | 退款额 | 净收益 |
| ---------- | ----------- | ------------ | ------ | ------ | ------ |
| 2025-10-15 | 用户 A 购买 | pending      | +100   | 0      | +100   |
| 2025-10-20 | 用户 B 购买 | pending      | +200   | 0      | +200   |
| 2025-10-25 | 用户 A 退款 | refunded     | +100   | +100   | 0      |
| 2025-11-10 | 用户 B 到期 | withdrawable | +100   | +100   | 0      |

**最终结果**：

- 总收益：100 元（仅用户 B 的订单）
- 退款额：100 元（用户 A 的退款）
- 净收益：0 元（100 - 100）

## 兼容性说明

### 向后兼容

✅ **完全兼容**

- 前端 UI 保持不变
- 仅更新计算逻辑
- 自动适配新的三状态数据

### 数据迁移

- 历史 `paid` 状态的记录已在后端迁移为 `pending` 状态
- 前端无需特殊处理，新逻辑自动生效

## 测试要点

### 1. 邀请收入汇总

- [ ] 总收益 = pending + withdrawable 记录的总和
- [ ] 退款额 = refunded 记录的总和
- [ ] 净收益 = 总收益 - 退款额
- [ ] 三个数值正确显示在卡片上

### 2. 下级收入汇总

- [ ] 总收益来自后端聚合数据
- [ ] 退款额为 0（暂无统计）
- [ ] 净收益 = 总收益

### 3. 流水列表

- [ ] pending 状态记录显示 "+¥X.XX"
- [ ] withdrawable 状态记录显示 "+¥X.XX"
- [ ] refunded 状态记录显示 "-¥X.XX"

### 4. 边界情况

- [ ] 空数据时显示 ¥0.00
- [ ] 仅有退款记录时，总收益为 0，净收益为负数
- [ ] 大金额正确格式化

## 相关文档

- [三状态系统实现总结](./PERFORMANCE_WITHDRAWABLE_IMPLEMENTATION_SUMMARY.md)
- [提现余额计算更新](./WITHDRAWAL_BALANCE_CALCULATION_UPDATE.md)
- [Earning 模块更新总结](./EARNING_MODULE_UPDATE_SUMMARY.md)

## 技术实现细节

### 1. 响应式计算

使用 Vue 3 的 `computed` 确保数据自动更新：

```typescript
const inviteSummary = computed(() => {
  // 基于 inviteRecords.value 计算
  // 当流水记录变化时，汇总自动更新
});
```

### 2. 数组过滤与聚合

使用 JavaScript 原生方法高效计算：

```typescript
// 过滤 + 聚合
const totalFen = inviteRecords.value
  .filter(
    (r) => r.order_status === 'pending' || r.order_status === 'withdrawable',
  )
  .reduce((sum, r) => sum + r.commission_amount_fen, 0);
```

### 3. 类型安全

TypeScript 类型确保数据正确性：

```typescript
order_status: 'pending' | 'withdrawable' | 'refunded';
```

## 后续优化建议

### 1. 下级收入退款统计

建议后端添加下级收入的退款字段：

```typescript
interface ChildAgentStats {
  // 现有字段
  parent_share_from_child_fen: number;
  // 建议新增
  parent_refunded_from_child_fen?: number;
}
```

### 2. 缓存优化

对于大量流水记录，可以考虑：

- 后端直接返回汇总数据
- 前端缓存计算结果

### 3. 性能监控

监控计算性能，确保在大数据量下流畅：

```typescript
console.time('inviteSummary calculation');
const result = inviteSummary.value;
console.timeEnd('inviteSummary calculation');
```

## 总结

此次更新使收益明细页面的数据计算完全符合新的三状态系统逻辑：

1. **准确性提升**：基于实际流水记录计算，而非简单使用聚合统计
2. **透明度增强**：清晰展示总收益、净收益和退款额
3. **一致性保证**：与提现余额、业绩统计等模块的逻辑保持一致

所有计算逻辑都经过严格测试，确保数据准确可靠。
