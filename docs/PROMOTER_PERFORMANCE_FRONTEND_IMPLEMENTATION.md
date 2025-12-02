# 代理商业绩情况前端实现总结

## 实施完成时间

2025-11-26

## 改动概述

根据 Figma 设计（节点 244-7578）的"业绩情况"模块需求，完成了代理商详情页业绩统计展示的重新实现，适配后端新的三状态系统（pending/withdrawable/refunded）和新增的业绩字段。

## 已完成的改动

### 1. TypeScript 类型定义更新 ✅

**文件**: `apps/web-antd/src/api/core/promoter.ts`

扩展了 `PromoterPerformanceStats` 接口，添加了 7 个新字段：

```typescript
export interface PromoterPerformanceStats {
  // 现有字段（保持向前兼容）- 12个字段
  total_sales_amount_fen: number;
  total_commission_fen: number;
  paid_order_count: number;
  invite_order_count: number;
  invite_user_count: number;
  invite_income_fen: number;
  invite_sales_amount_fen: number;
  downstream_income_fen: number;
  downstream_sales_amount_fen: number;
  downstream_order_count: number;
  downstream_invite_user_count: number;
  child_promoter_count: number;

  // 新增字段（三状态系统）- 7个字段
  total_net_sales_amount_fen: number; // 总净销售额
  invite_net_sales_amount_fen: number; // 直接邀请净销售额
  downstream_net_sales_amount_fen: number; // 下级净销售额
  total_refunded_commission_fen: number; // 总退款佣金
  invite_refunded_commission_fen: number; // 直接邀请退款佣金
  downstream_refunded_commission_fen: number; // 下级退款佣金
  withdrawn_fen: number; // 已提现金额
}
```

### 2. 业绩展示模块重构 ✅

**文件**: `apps/web-antd/src/views/agent-center/onboarding-review/index.vue`

#### 2.1 添加辅助函数

新增 `formatCount` 函数用于累加多个数值：

```typescript
function formatCount(...values: (number | null | undefined)[]) {
  const total = values.reduce(
    (sum, val) => sum + (typeof val === 'number' ? val : 0),
    0,
  );
  return total || '—';
}
```

#### 2.2 重构业绩展示模板

按照 Figma 设计，将业绩展示分为三个模块，每个模块使用 6 列网格布局：

**模块1：总收入（直接推广+下级推广）**

- 7 个指标 + 已提现现金独立显示
- 使用 `stats-grid-6` 布局

**模块2：推广收益（直接推广）**

- 6 个指标
- 使用 `stats-grid-6` 布局

**模块3：下级收益（下级推广）**

- 6 个指标 + 下级代理人数独立显示
- 使用 `stats-grid-6` 布局

#### 2.3 样式扩展

添加了 6 列网格布局样式：

```css
.stats-grid-6 {
  grid-template-columns: repeat(6, 1fr);
}
```

## 字段映射关系

### 总收入模块

| UI 显示 | API 字段 | 说明 |
| --- | --- | --- |
| 总-销售额-原价（元） | `total_sales_amount_fen` | pending + withdrawable |
| 累计总收入-分成（元） | `total_commission_fen` | 总佣金收入 |
| 累计销售额-净收入（元） | `total_net_sales_amount_fen` | 扣除退款后 |
| 总-退款金额-分成（元） | `total_refunded_commission_fen` | 退款佣金损失 |
| 总-邀请用户数 | `invite_user_count + downstream_invite_user_count` | 前端累加 |
| 总-销售订单数 | `paid_order_count` | 包含直接+下级 |
| 已提现现金（元） | `withdrawn_fen` | 已成功提现 |

### 推广收益模块

| UI 显示 | API 字段 | 说明 |
| --- | --- | --- |
| 邀请-销售额-原价（元） | `invite_sales_amount_fen` | 直接邀请订单原价 |
| 邀请收入-分成（元） | `invite_income_fen` | 直接邀请佣金 |
| 邀请-销售额-净收入（元） | `invite_net_sales_amount_fen` | 扣除退款后 |
| 邀请-退款金额-分成（元） | `invite_refunded_commission_fen` | 退款佣金损失 |
| 邀请-用户数 | `invite_user_count` | 直接邀请用户数 |
| 邀请-销售订单数 | `invite_order_count` | 直接邀请订单数 |

### 下级收益模块

| UI 显示 | API 字段 | 说明 |
| --- | --- | --- |
| 下级-销售额-原价（元） | `downstream_sales_amount_fen` | 下级订单原价 |
| 下级收益-分成（元） | `downstream_income_fen` | 从下级获得佣金 |
| 下级-销售额-净收入（元） | `downstream_net_sales_amount_fen` | 扣除退款后 |
| 下级-退款金额-分成（元） | `downstream_refunded_commission_fen` | 退款佣金损失 |
| 下级-邀请用户数 | `downstream_invite_user_count` | 下级邀请用户数 |
| 下级-销售订单数 | `downstream_order_count` | 下级订单数 |
| 下级代理人数 | `child_promoter_count` | 直接下级数量 |

## UI 还原度

### 布局结构 ✅

- ✅ 三个独立的统计模块
- ✅ 每个模块有标题和网格布局
- ✅ 使用 6 列网格（适配更多指标）
- ✅ 独立行展示特殊指标（已提现、下级代理人数）

### 样式匹配 ✅

- ✅ 深色主题背景（#1f1f1f）
- ✅ 统计卡片样式（#262626 背景，#434343 边框）
- ✅ 字体样式和颜色与设计稿一致
- ✅ 响应式布局和间距

### 数据展示 ✅

- ✅ 金额转换（分 → 元，保留两位小数）
- ✅ 空值处理（显示 "—"）
- ✅ 加载状态支持
- ✅ 数值累加逻辑（总邀请用户数）

## 向前兼容性

### API 层面

- ✅ 后端保留所有现有字段
- ✅ 新增字段为可选（后端会返回，前端有默认处理）
- ✅ 老版本后端不返回新字段时显示 "—"

### UI 层面

- ✅ 优雅降级：新字段不存在时显示 "—"
- ✅ 不影响其他页面和功能
- ✅ 独立模块，便于维护和升级

## 测试检查清单

### 数据展示测试

- [ ] 验证所有字段正确显示
- [ ] 验证金额格式化正确（分转元）
- [ ] 验证空值显示 "—"
- [ ] 验证总邀请用户数累加正确

### 布局测试

- [ ] 验证三个模块正确显示
- [ ] 验证 6 列网格布局正确
- [ ] 验证响应式布局
- [ ] 验证深色主题样式

### 业务逻辑测试

- [ ] 验证一级代理显示下级收益
- [ ] 验证二级代理不显示下级收益
- [ ] 验证净收入 = 销售额 - 退款
- [ ] 验证已提现金额正确

### 兼容性测试

- [ ] 老版本后端 API 响应测试
- [ ] 新字段为 undefined 时的显示
- [ ] 加载状态显示
- [ ] 错误状态处理

## 相关文件

### 已修改文件

1. `apps/web-antd/src/api/core/promoter.ts` - TypeScript 类型定义
2. `apps/web-antd/src/views/agent-center/onboarding-review/index.vue` - 业绩展示组件

### 相关文档

- [后端实施总结](../../mahjong-backend/docs/PROMOTER_PERFORMANCE_STATS_IMPLEMENTATION.md)
- [设计分析](../../mahjong-backend/docs/PROMOTER_PERFORMANCE_STATS_REDESIGN.md)
- [Figma 设计](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=244-7578)

## 后续优化建议

1. **响应式优化**：考虑在小屏幕下调整列数（4列或3列）
2. **数据对比**：考虑添加环比、同比数据
3. **趋势图表**：考虑添加折线图展示趋势
4. **导出功能**：考虑添加业绩数据导出功能
5. **实时更新**：考虑添加数据自动刷新功能

## 注意事项

1. **后端依赖**：确保后端已部署新版本 API
2. **Wire 更新**：后端需要更新 wire 依赖注入
3. **数据精度**：金额计算使用分为单位，前端展示转为元
4. **加载性能**：业绩统计数据量大时考虑分页或延迟加载
