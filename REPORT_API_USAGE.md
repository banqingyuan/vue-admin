# Report 接口使用指南

## 📚 概述

Report 接口是一个通用的数据报表查询接口，支持灵活的指标配置、多数据源模块组合、时间粒度选择等功能。

## 🔗 接口信息

### 前端 API

- **路径**: `/analyse/report`
- **方法**: `POST`
- **函数**: `generateReport(data: ReportRequest): Promise<ReportResponse>`
- **位置**: `apps/web-antd/src/api/core/report.ts`

### 后端 Handler

- **路径**: `/api/analyse/report`
- **Handler**: `ReportHandler.GenerateReport`
- **位置**: `cmd/admin_backend/handler/report_handler.go`

---

## 📋 请求参数 (ReportRequest)

### 基础参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `granularity` | `TimeGranularity` | ✅ | 时间粒度：`hour`/`day`/`week`/`month`/`year` |
| `start_time` | `string` | ✅ | 开始时间 (ISO格式) |
| `end_time` | `string` | ✅ | 结束时间 (ISO格式) |
| `metrics` | `MetricConfig[]` | ✅ | 指标列表，至少1个 |

### 模块和筛选

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `modules` | `string[]` | ❌ | 数据模块：`["users", "orders", "analytics", "retention"]` |
| `filters` | `Record<string, any>` | ❌ | 筛选条件（如渠道过滤） |
| `group_by` | `string[]` | ❌ | 分组字段 |

### 分页和排序

| 字段        | 类型     | 必填 | 说明                       |
| ----------- | -------- | ---- | -------------------------- |
| `page`      | `number` | ❌   | 页码，默认1                |
| `page_size` | `number` | ❌   | 每页大小，默认20，最大1000 |
| `order_by`  | `string` | ❌   | 排序字段                   |
| `order_dir` | `string` | ❌   | 排序方向：`asc`/`desc`     |

### 高级选项

| 字段              | 类型         | 必填 | 说明                            |
| ----------------- | ------------ | ---- | ------------------------------- |
| `include_total`   | `boolean`    | ❌   | 是否包含汇总数据                |
| `include_compare` | `boolean`    | ❌   | 是否包含同比环比                |
| `report_type`     | `ReportType` | ❌   | **已废弃**，使用 `modules` 替代 |

---

## 📊 MetricConfig (指标配置)

```typescript
interface MetricConfig {
  name: string; // 指标名称
  type: MetricType; // 指标类型：count/sum/avg/max/min/rate/percent
  field?: string; // 计算字段（用于 sum/avg 等）
  alias?: string; // 别名
  description?: string; // 描述
}
```

### 常用指标名称

#### 用户相关

- `install_count` - 激活设备数（来自 activated_devices 表）
- `new_users` - 新注册用户数
- `active_users` - 活跃用户数
- `retention_rate` - 留存率

#### 订单相关

- `order_count` - 订单数
- `total_revenue` - 总收入（单位：厘，需除以1000转为元）
- `avg_order_value` - 客单价
- `payment_success_rate` - 支付成功率

#### 队列分析

- `registration_count` - 注册设备数
- `order_amount` - 订单金额
- `payment_rate` - 新用户付费率
- `retention_rate` - 老用户续费率
- `revenue_share` - 付费占比

---

## 🎯 响应数据 (ReportResponse)

```typescript
interface ReportResponse {
  report_type: ReportType;
  granularity: TimeGranularity;
  start_time: string;
  end_time: string;
  generated_at: string;

  // 核心数据
  data: ReportDataItem[]; // 时间序列数据
  summary?: ReportSummary; // 汇总数据
  comparison?: ReportComparison; // 对比数据

  // 元数据
  metadata: ReportMetadata;
  pagination?: PaginationInfo;
}
```

### ReportDataItem (时间序列数据项)

```typescript
interface ReportDataItem {
  time: string; // 时间点
  metrics: Record<string, any>; // 指标值
  group_by?: Record<string, any>; // 分组值
  metadata?: Record<string, any>; // 元数据
}
```

### ReportSummary (汇总数据)

```typescript
interface ReportSummary {
  total_records: number;
  metrics: Record<string, any>; // 汇总指标
  trends?: Record<string, number>;
  highlights?: string[];
}
```

**常见汇总指标名称**：

- `install_count` - 总激活数
- `total_new_users` / `registration_count` - 总注册数
- `total_orders` / `order_count` - 总订单数
- `total_revenue` / `order_amount` - 总收入（厘）

---

## 💡 使用示例

### 示例 1: 获取 CPS 渠道数据（看板汇总）

```typescript
import { generateReport, ReportType, TimeGranularity } from '#/api/core/report';
import dayjs from 'dayjs';

async function getCPSChannelData() {
  const req = {
    report_type: ReportType.USER, // 可选，兼容字段
    granularity: TimeGranularity.DAY,
    start_time: dayjs().subtract(30, 'day').toISOString(),
    end_time: dayjs().toISOString(),

    // 核心配置：指定需要的数据模块
    modules: ['users', 'orders'],

    // 指标配置
    metrics: [
      { name: 'install_count', type: 'count' },
      { name: 'new_users', type: 'count' },
      { name: 'order_count', type: 'count' },
      { name: 'total_revenue', type: 'sum', field: 'amount' },
    ],

    // 筛选条件：按渠道包过滤
    filters: {
      channel_names: ['pkg1', 'pkg2', 'pkg3'],
    },

    // 包含汇总数据
    include_total: true,

    // 不需要分页（或设置大的 page_size）
    page: 1,
    page_size: 1000,
  };

  const resp = await generateReport(req);

  // 获取汇总数据
  const summary = resp.summary?.metrics || {};
  const totalInstalls = Number(summary.install_count || 0);
  const totalRegistrations = Number(
    summary.total_new_users || summary.registration_count || 0,
  );
  const totalOrders = Number(summary.total_orders || summary.order_count || 0);
  const totalRevenue = Number(
    summary.total_revenue || summary.order_amount || 0,
  );
  const totalAmount = totalRevenue / 1000; // 厘转元

  // 获取每日数据
  const dailyData = resp.data || [];

  return {
    summary: { totalInstalls, totalRegistrations, totalOrders, totalAmount },
    dailyData,
  };
}
```

### 示例 2: 导出每日数据到 Excel

```typescript
async function exportDailyData() {
  const req = {
    granularity: TimeGranularity.DAY,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    modules: ['users', 'orders'],
    metrics: [
      { name: 'install_count', type: 'count' },
      { name: 'new_users', type: 'count' },
      { name: 'order_count', type: 'count' },
      { name: 'total_revenue', type: 'sum', field: 'amount' },
    ],
    filters: { channel_names: selectedChannels },
    include_total: true,
    page_size: 1000,
  };

  const resp = await generateReport(req);
  const dataItems = resp.data || [];

  // 按日期分组合并（重要！同一天可能有多条记录）
  const dataByDate = new Map();
  dataItems.forEach((item) => {
    const dateKey = dayjs(item.time).format('YYYY-MM-DD');
    const metrics = item.metrics || {};

    if (!dataByDate.has(dateKey)) {
      dataByDate.set(dateKey, {
        date: dateKey,
        installCount: 0,
        newUsers: 0,
        orderCount: 0,
        totalRevenue: 0,
      });
    }

    const existing = dataByDate.get(dateKey);
    existing.installCount += Number(metrics.install_count || 0);
    existing.newUsers += Number(metrics.new_users || 0);
    existing.orderCount += Number(metrics.order_count || 0);
    existing.totalRevenue += Number(metrics.total_revenue || 0);
  });

  // 转换为数组并排序
  const data = Array.from(dataByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      日期: item.date,
      激活数: item.installCount,
      注册数: item.newUsers,
      订单数: item.orderCount,
      付费金额: (item.totalRevenue / 1000).toFixed(2) + '元',
    }));

  // 使用 xlsx 导出...
}
```

### 示例 3: 按渠道分组查询

```typescript
async function getDataByChannel() {
  const req = {
    granularity: TimeGranularity.DAY,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    modules: ['users', 'orders'],
    metrics: [
      { name: 'new_users', type: 'count' },
      { name: 'order_count', type: 'count' },
    ],
    group_by: ['channel_name'], // 按渠道分组
    page_size: 1000,
  };

  const resp = await generateReport(req);

  // 数据会按 channel_name 分组
  resp.data.forEach((item) => {
    console.log('时间:', item.time);
    console.log('渠道:', item.group_by?.channel_name);
    console.log('指标:', item.metrics);
  });
}
```

---

## 🔍 Filters 筛选条件

### 常用筛选字段

| 字段              | 类型       | 说明               |
| ----------------- | ---------- | ------------------ |
| `channel_names`   | `string[]` | 渠道包列表（多个） |
| `channel_name`    | `string`   | 单个渠道包         |
| `channel_sources` | `string[]` | 渠道来源列表       |
| `channel_source`  | `string`   | 单个渠道来源       |
| `user_ids`        | `number[]` | 用户ID列表         |
| `device_ids`      | `string[]` | 设备ID列表         |

### 筛选示例

```typescript
// 按多个渠道包筛选
filters: {
  channel_names: ['guandan_001', 'guandan_002', 'guandan_003']
}

// 按渠道来源筛选
filters: {
  channel_sources: ['toutiao', 'kuaishou', 'oppo']
}

// 组合筛选
filters: {
  channel_names: ['pkg1', 'pkg2'],
  channel_sources: ['toutiao']
}
```

---

## ⚠️ 重要注意事项

### 1. 数据合并问题

**同一天可能有多条记录！** 因为 `modules: ['users', 'orders']` 会并行查询两个数据源，返回的数据需要按日期合并。

✅ **正确做法**：

```typescript
const dataByDate = new Map();
dataItems.forEach((item) => {
  const dateKey = dayjs(item.time).format('YYYY-MM-DD');
  // 累加同一天的数据...
});
```

❌ **错误做法**：

```typescript
// 直接遍历会导致重复数据
dataItems.map(item => ({ date: item.time, ... }))
```

### 2. 金额单位转换

后端存储的金额单位是**厘**（1元 = 1000厘），前端需要转换为元：

```typescript
const amountInYuan = (totalRevenue / 1000).toFixed(2);
```

### 3. Summary 字段名称差异

汇总数据中，不同版本可能使用不同的字段名：

```typescript
// 注册数
const registrations =
  summary.total_new_users || summary.registration_count || 0;

// 订单数
const orders = summary.total_orders || summary.order_count || 0;

// 收入
const revenue = summary.total_revenue || summary.order_amount || 0;
```

### 4. 时间粒度限制

- `page_size` 最大 1000
- 查询大时间范围时，建议使用 `week` 或 `month` 粒度
- 导出功能建议设置 `page_size: 1000` 获取完整数据

### 5. Modules 组合

推荐使用 `modules` 而非旧的 `report_type`：

```typescript
// ✅ 新方式（推荐）
modules: ['users', 'orders'];

// ⚠️ 旧方式（兼容）
report_type: ReportType.USER;
```

---

## 📖 后端实现参考

### Handler 入口

- **文件**: `cmd/admin_backend/handler/report_handler.go`
- **函数**: `GenerateReport(c *gin.Context)`

### Service 实现

- **文件**: `internal/service/report_service.go`
- **函数**: `GenerateReport(ctx context.Context, req *model.ReportRequest)`

### 模块处理

根据 `modules` 字段，后端会并行查询：

- `users` → `generateUserReport()` - 用户数据
- `orders` → `generateRevenueReport()` - 订单数据
- `analytics` → `generateAnalyticsReport()` - 埋点数据
- `retention` → `generateRetentionReport()` - 留存数据

---

## 🎓 完整调用流程

```
前端发起请求
    ↓
POST /analyse/report
    ↓
report_handler.go: GenerateReport()
    ↓
report_service.go: GenerateReport()
    ↓
并行查询各模块数据:
  - users → userRepo.CountNewUsersByTimeRange()
  - orders → orderRepo (查询订单和收入)
    ↓
合并数据 & 计算汇总
    ↓
返回 ReportResponse
    ↓
前端处理数据
    ↓
按日期分组合并（重要！）
    ↓
渲染或导出
```

---

## 📝 实际项目使用位置

### CPS 渠道看板

1. **渠道商看板**: `apps/web-antd/src/views/distributor/board/index.vue`
2. **管理员看板**: `apps/web-antd/src/views/data-board/distributor/index.vue`
3. **通用 Hook**: `apps/web-antd/src/composables/useDistributorBoard.ts`
4. **自然量渠道特殊规则**: 若渠道包名为“ASO新/ASO旧”，后端会自动将真实渠道名折叠为“自然量”，并在北京时间 2025-11-16 00:00:00 处做注册时间切分，同时强制限定为 iOS 设备数据，前端无需感知。

---

## 🆘 常见问题

**Q: 为什么同一天的数据被拆成多行？** A: 因为 `modules` 会并行查询多个数据源，需要手动按日期合并。

**Q: 为什么金额显示错误？** A: 后端存储单位是厘，需要除以 1000 转为元。

**Q: 如何获取指定渠道的数据？** A: 在 `filters` 中添加 `channel_names: ['pkg1', 'pkg2']`。

**Q: 如何导出所有数据？** A: 设置 `page_size: 1000` 并一次性获取。

**Q: Summary 数据为空怎么办？** A: 确保请求中设置了 `include_total: true`。

---

生成时间: 2025-10-23版本: 1.0
