# 高级代理主页实现计划

## 已完成 ✅

### 后端接口（100%）

1. ✅ `GET /api/promoter/withdrawal/balance` - 提现余额详情
2. ✅ `GET /api/promoter/self-promotion-stats` - 自身推广统计
3. ✅ `GET /api/promoter/commission-rates` - 佣金比例配置
4. ✅ 路由注册到 http.go
5. ✅ Wire 依赖注入配置

### 前端基础（60%）

1. ✅ API 接口定义 (`src/api/agent.ts`)
2. ✅ Pinia Store (`src/store/agent.ts`)
3. ✅ AgentHome 主页面骨架 (`src/pages/AgentHome.vue`)

## 待实现 📝

### 1. AccountStatus 组件

**文件**: `src/components/agent/AccountStatus.vue`

**参考 Figma**: Node `1:5448` (账号状态)

**实现要点**:

```vue
<template>
  <div class="account-status">
    <!-- 头像 -->
    <div class="avatar">
      <svg><!-- 默认用户图标 --></svg>
    </div>

    <!-- 信息区 -->
    <div class="info">
      <div class="title-row">
        <p class="title">AI扑克记牌器</p>
        <div class="level-badge">高级代理</div>
      </div>
      <div class="details">
        <p>代理 ID：{{ formatPromoterID }}</p>
        <p>手机号：{{ formatPhone }}</p>
      </div>
    </div>

    <!-- 设置按钮 -->
    <button class="settings-btn" @click="goSettings">
      <svg><!-- 设置图标 --></svg>
    </button>
  </div>
</template>

<style scoped>
.account-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--basic-0);
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--basic-2);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.level-badge {
  background: linear-gradient(135deg, #ffe395, #fff2cc);
  padding: 2px 4px;
  border-radius: 6px 0 6px 0;
  font-size: 15px;
  color: #000;
}
</style>
```

### 2. EarningsCard 组件

**文件**: `src/components/agent/EarningsCard.vue`

**参考 Figma**: Node `122:5255` (总收益)

**数据来源**: `useAgentStore().withdrawalBalance`

**实现要点**:

- 总收益、待结算、可提现三个数据项
- 金额单位转换：`fen / 100` 保留2位小数
- 右上角按钮："收入明细" + "立即提现"
- 边框使用 `border: 1px solid var(--primary-6)`
- 背景使用 `background: rgba(255, 227, 149, 0.1)`

**数字格式化**:

```typescript
function formatMoney(fen: number): string {
  return (fen / 100).toFixed(2);
}
```

### 3. TeamCard 组件

**文件**: `src/components/agent/TeamCard.vue`

**参考 Figma**: Node `1:5464` (下级代理)

**数据来源**: `useAgentStore().childrenStats`

**实现要点**:

- 仅一级代理显示 (`v-if="agentStore.promoterInfo?.level === 1"`)
- 标题显示人数：`{{ childrenStats.length }} 人`
- 分成比例：从 `commissionRates.level1_from_level2` 获取
- 收益数据聚合：

  ```typescript
  const totalEarnings = computed(
    () =>
      childrenStats.value.reduce(
        (sum, child) => sum + child.parent_share_from_child_fen,
        0,
      ) / 100,
  );

  const totalOrders = computed(() =>
    childrenStats.value.reduce((sum, child) => sum + child.paid_order_count, 0),
  );

  const totalInvites = computed(() =>
    childrenStats.value.reduce((sum, child) => sum + child.invite_count, 0),
  );
  ```

### 4. PromotionCard 组件

**文件**: `src/components/agent/PromotionCard.vue`

**参考 Figma**: Node `122:5326` (推广)

**数据来源**: `useAgentStore().selfPromotionStats` + `commissionRates`

**实现要点**:

- 显示邀请码（大号字体，金色）
- 分成比例说明：根据 level 显示不同比例
  - Level 1: `commissionRates.level1_direct` (60%/40%)
  - Level 2: `commissionRates.level2_direct`
- 提示文案："一次绑定，长线收益分成！！"
- 收益数据：`total_revenue_fen / 100`
- 底部按钮："查看邀请记录" + "去推广"

### 5. 路由配置

**文件**: `src/router/index.ts`

**添加路由**:

```typescript
{
  path: '/agent/home',
  component: () => import('#/pages/AgentHome.vue'),
  meta: {
    title: '代理主页',
    requiresAuth: true,
    requiresActive: true  // 需要active状态
  }
}
```

**更新路由守卫**:

```typescript
router.beforeEach(async (to, from, next) => {
  // ... 现有逻辑

  if (status === 'active' || status === 'pass') {
    // 审核通过 -> 跳转到代理主页
    if (to.path !== '/agent/home') {
      next('/agent/home');
      return;
    }
  }

  // ...
});
```

### 6. 样式规范

**CSS 变量使用** (已在项目中定义):

```css
--basic-0: #141414; /* 背景色 */
--basic-1: #1f1f1f; /* 卡片背景 */
--basic-2: #262626; /* 深色卡片背景 */
--basic-3: #434343; /* 边框 */
--basic-5: #8c8c8c; /* 辅助文字 */
--basic-10: #ffffff; /* 主文字 */
--primary-6: #ffe395; /* 金色主色 */
```

**字体规范**:

- 标题：`font-size: 16px; font-weight: 600`
- 金额：`font-size: 18-20px; font-family: 'DingTalk JinBuTi'` (数字字体)
- 正文：`font-size: 14px; font-weight: 400`

**卡片样式**:

```css
.card {
  background: var(--basic-2);
  border: 1px solid var(--basic-3);
  border-radius: 16px;
  padding: 12px;
}
```

### 7. 下拉刷新实现

使用 `vant` 的 PullRefresh 组件：

```vue
<van-pull-refresh v-model="refreshing" @refresh="onRefresh">
  <div class="main-content">
    <!-- 卡片内容 -->
  </div>
</van-pull-refresh>
```

或自定义实现：

```typescript
let startY = 0;
let isPulling = false;

function handleTouchStart(e: TouchEvent) {
  startY = e.touches[0].clientY;
  isPulling = window.scrollY === 0;
}

function handleTouchMove(e: TouchEvent) {
  if (!isPulling) return;
  const deltaY = e.touches[0].clientY - startY;
  if (deltaY > 80) {
    // 触发刷新
    onRefresh();
  }
}
```

## Figma 数据对照表

| UI 元素 | Figma Node | 数据来源 | API 字段 |
| --- | --- | --- | --- |
| 总收益 | 122:5255 | withdrawal/balance | total_earnings_fen |
| 待结算 | 122:5255 | withdrawal/balance | pending_settlement_fen |
| 可提现 | 122:5255 | withdrawal/balance | withdrawable_fen |
| 下级代理人数 | 1:5464 | children | length |
| 下级代理收益 | 1:5464 | children | sum(parent_share_from_child_fen) |
| 邀请码 | 122:5326 | self-promotion-stats | invitation_code |
| 邀请人数 | 122:5326 | self-promotion-stats | invite_count |
| 订单数 | 122:5326 | self-promotion-stats | paid_order_count |
| 推广收益 | 122:5326 | self-promotion-stats | total_revenue_fen |

## 测试检查清单

- [ ] 一级代理正常显示三个卡片
- [ ] 二级代理只显示两个卡片（隐藏下级代理卡片）
- [ ] 金额显示正确（分转元，保留2位小数）
- [ ] 分成比例正确显示
- [ ] 轮询功能正常（30秒刷新）
- [ ] 下拉刷新功能正常
- [ ] 点击按钮跳转正确
- [ ] 状态检查和重定向正常
- [ ] 样式与 Figma 一致

## 快速开发步骤

1. 复制本目录下的组件模板
2. 运行 `pnpm dev` 启动开发服务器
3. 访问 `/agent/home` 查看页面
4. 使用 Chrome DevTools 对比 Figma 截图
5. 使用 Figma MCP 工具获取精确的间距、字号、颜色
6. 逐个组件调整至完美匹配

## 注意事项

1. **数据格式转换**：所有金额单位都是"分"，需要除以100转为"元"
2. **权限控制**：二级代理不显示"下级代理卡片"
3. **错误处理**：网络请求失败要显示错误提示或重试按钮
4. **性能优化**：使用计算属性缓存聚合数据
5. **响应式设计**：确保在375px基准下完美显示
6. **轮询管理**：页面卸载时清除定时器，避免内存泄漏
