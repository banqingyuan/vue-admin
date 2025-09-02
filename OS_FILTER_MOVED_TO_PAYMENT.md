# 操作系统筛选功能调整说明

## 📝 调整内容

将操作系统筛选功能从 **CPS渠道看板** 移动到 **付费数据看板（队列分析）**。

## 🔄 修改对比

### 原来的位置（已移除）

- ❌ CPS渠道商看板 (`/views/distributor/board/index.vue`)
- ❌ CPS管理员看板 (`/views/data-board/distributor/index.vue`)
- ❌ useDistributorBoard Hook

### 现在的位置（已添加）

- ✅ 付费数据看板 - 队列分析表 (`/views/data-board/payment/components/CohortAnalysisTable.vue`)

## 🎯 功能实现

### 付费数据看板 - CohortAnalysisTable.vue

#### 1. 新增UI组件

```vue
<Select
  v-model:value="selectedOS"
  placeholder="操作系统"
  style="width: 130px"
  :options="osOptions"
  @change="loadCohortData"
/>
```

位置：在渠道选择器和刷新按钮之间

#### 2. 数据状态

```typescript
// 操作系统筛选
const selectedOS = ref<string | undefined>(undefined);
const osOptions = [
  { label: '全部', value: undefined },
  { label: '安卓', value: 'android' },
  { label: 'iOS', value: 'ios' },
];
```

#### 3. 数据过滤逻辑

```typescript
// 在 loadCohortData 函数中
const filters: Record<string, any> = {};
// ... 渠道过滤 ...

// 添加设备类型过滤
if (selectedOS.value) {
  filters.device_type = selectedOS.value;
}
```

## 🗑️ 清理内容

### 1. CPS渠道商看板 (`distributor/board/index.vue`)

- ✅ 移除 `selectedOS` 状态
- ✅ 移除 `osOptions` 选项
- ✅ 移除 `handleOSChange` 函数
- ✅ 移除操作系统下拉组件
- ✅ 移除导出功能中的 device_type 过滤

### 2. CPS管理员看板 (`data-board/distributor/index.vue`)

- ✅ 移除 `selectedOS` 状态
- ✅ 移除 `osOptions` 选项
- ✅ 移除 `handleOSChange` 函数
- ✅ 移除操作系统下拉组件
- ✅ 移除导出功能中的 device_type 过滤

### 3. useDistributorBoard Hook

- ✅ 移除 `getDeviceType` 接口定义
- ✅ 移除 `getDeviceType` 回调调用
- ✅ 移除 device_type 参数传递

## 📊 界面对比

### 付费数据看板（新增）

```
[日期范围▼] [选择渠道▼] [操作系统▼] [刷新] [导出Excel]
                        全部
                        安卓
                        iOS
```

### CPS渠道看板（已移除）

```
[选择分销商] [选择渠道包] [日期范围] [下载数据] [退出登录]
（不再包含操作系统选择）
```

## 🔍 数据流程

### 付费数据看板数据流

```
用户选择操作系统
    ↓
selectedOS.value = 'android' | 'ios' | undefined
    ↓
loadCohortData() 触发
    ↓
构造 ReportRequest:
  {
    modules: ['retention'],
    filters: {
      channel_sources: [...],
      device_type: 'android'  // 新增
    },
    cohort_analysis: {
      enabled: true,
      ...
    }
  }
    ↓
POST /analyse/report
    ↓
后端 retention 模块处理
    ↓
返回队列分析数据（按OS筛选）
```

## 📁 修改文件清单

### 前端文件（4个）

1. ✅ `apps/web-antd/src/views/data-board/payment/components/CohortAnalysisTable.vue` - **添加**操作系统筛选
2. ✅ `apps/web-antd/src/views/distributor/board/index.vue` - **移除**操作系统筛选
3. ✅ `apps/web-antd/src/views/data-board/distributor/index.vue` - **移除**操作系统筛选
4. ✅ `apps/web-antd/src/composables/useDistributorBoard.ts` - **移除**device_type相关代码

### 后端文件（无需修改）

后端的 device_type 筛选逻辑保持不变，继续支持通过 `activated_devices` 表关联筛选：

- `internal/repository/user.go` - 用户查询支持 device_type
- `internal/repository/order.go` - 订单查询支持 device_type

## ✨ 功能特性

### 1. 筛选范围

- ✅ 影响注册设备数（registration_count）
- ✅ 影响订单数（order_count）
- ✅ 影响订单金额（order_amount）
- ✅ 影响付费率和续费率
- ✅ 影响新用户和老用户的队列分析

### 2. 组合筛选

可以与以下筛选条件组合使用：

- 日期范围（必选）
- 渠道选择（多选）
- 注册队列月份
- 分析月份

### 3. 数据准确性

- 通过 `activated_devices` 表的 `device_type` 和 `registered_user_ids` 关联
- 确保用户和订单都按照正确的设备类型筛选
- 支持一个用户多设备的场景

## 🧪 测试建议

### 1. 付费数据看板测试

```bash
# 访问付费数据看板
http://localhost:5555/data-board/payment
```

**测试步骤**：

1. 选择日期范围（必选）
2. 选择渠道（可选）
3. 选择操作系统：
   - 全部 → 显示所有平台数据
   - 安卓 → 只显示安卓用户数据
   - iOS → 只显示iOS用户数据
4. 点击刷新，查看数据变化
5. 导出Excel，验证导出数据正确

### 2. CPS看板测试

确认CPS看板不再有操作系统选择：

- 渠道商看板 (`/distributor/board`)
- 管理员看板 (`/data-board/distributor`)

### 3. 数据验证

```sql
-- 验证队列分析中的设备类型筛选
SELECT
  to_char(u.created_at, 'YYYY-MM') as registration_month,
  ad.device_type,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(o.id) as order_count,
  SUM(o.amount) as total_amount
FROM users u
JOIN activated_devices ad ON u.id = ANY(ad.registered_user_ids)
LEFT JOIN orders o ON o.user_id = u.id AND o.payment_status = 'paid'
WHERE u.created_at >= '2024-01-01'
  AND ad.device_type = 'android'  -- 或 'ios'
GROUP BY registration_month, ad.device_type
ORDER BY registration_month DESC;
```

## 📝 注意事项

### 1. 为什么要移动？

- 付费数据看板主要用于分析用户付费行为
- 需要更细粒度的筛选（按设备类型）
- CPS渠道看板主要关注渠道整体表现
- 操作系统筛选在付费分析中更有价值

### 2. 影响范围

- ✅ 不影响后端API（device_type 参数继续支持）
- ✅ 不影响数据库结构
- ✅ 完全向后兼容（不传 device_type 时行为不变）
- ✅ CPS看板功能保持完整（只是移除了OS筛选）

### 3. 队列分析特性

- 队列分析是按月粒度统计
- 操作系统筛选影响整个分析维度
- 新用户/老用户的划分基于注册月份和设备类型
- 可以看到不同OS用户的付费表现差异

## 🎯 使用场景

### 典型分析场景

#### 场景1：iOS vs Android 付费对比

```
1. 选择最近6个月
2. 选择"全部渠道"
3. 选择"iOS"
4. 查看付费率和ARPU
5. 切换到"安卓"
6. 对比两个平台的付费表现
```

#### 场景2：特定渠道的平台表现

```
1. 选择时间范围
2. 选择特定渠道（如"toutiao"）
3. 选择"iOS"
4. 分析该渠道iOS用户的留存和付费
5. 切换到"安卓"
6. 对比同一渠道不同平台的差异
```

#### 场景3：导出平台数据报告

```
1. 配置筛选条件（时间、渠道、OS）
2. 点击"导出Excel"
3. 生成包含详细队列数据的报告
4. 用于月度/季度数据分析
```

## 🚀 部署说明

### 前端部署

```bash
cd /Users/qingyuan/qingyuaner/vue-vben-admin/apps/web-antd
pnpm build
```

### 检查清单

- [ ] 付费数据看板显示操作系统下拉框
- [ ] CPS渠道看板不显示操作系统下拉框
- [ ] 操作系统筛选功能正常工作
- [ ] 队列分析数据按OS正确筛选
- [ ] 导出功能包含OS筛选
- [ ] 无JavaScript错误

## 📖 相关文档

- 原实现文档：`OS_FILTER_FEATURE.md`
- Report API文档：`REPORT_API_USAGE.md`
- 后端实现：`internal/repository/user.go`, `order.go`

---

**调整时间**: 2025-10-23  
**版本**: 2.0  
**状态**: ✅ 已完成
