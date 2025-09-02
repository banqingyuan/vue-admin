# 操作系统筛选功能实现说明

## 📝 功能概述

为CPS渠道看板（包括管理员看板和渠道商看板）添加操作系统筛选功能，支持按"全部"、"安卓"、"iOS"筛选数据。

## 🎯 实现范围

### 前端实现

#### 1. 渠道商看板 (`/views/distributor/board/index.vue`)

**新增状态和选项**：

```typescript
const selectedOS = ref<string | undefined>(undefined);
const osOptions = [
  { label: '全部', value: undefined },
  { label: '安卓', value: 'android' },
  { label: 'iOS', value: 'ios' },
];
```

**新增UI组件**：

```vue
<Select
  v-model:value="selectedOS"
  placeholder="操作系统"
  class="toolbar-item"
  style="width: 130px"
  :options="osOptions"
  @change="handleOSChange"
/>
```

**数据查询集成**：

- 在 `useDistributorBoard` 中添加 `getDeviceType` 回调
- 在看板数据加载时传递 `device_type` 过滤参数
- 在导出功能中也支持 `device_type` 过滤

#### 2. 管理员看板 (`/views/data-board/distributor/index.vue`)

相同的实现方式：

- 添加 `selectedOS` 状态和 `osOptions` 选项
- 添加操作系统下拉选择组件
- 在数据查询和导出中传递 `device_type` 参数

#### 3. Composable Hook (`/composables/useDistributorBoard.ts`)

**扩展接口**：

```typescript
export interface PackagesProviderCtx {
  getAllPackages: () => Promise<string[]>;
  getDeviceType?: () => string | undefined; // 新增
}
```

**数据查询逻辑**：

```typescript
if (provider.getDeviceType) {
  const deviceType = provider.getDeviceType();
  if (deviceType) {
    req.filters.device_type = deviceType;
  }
}
```

### 后端实现

#### 1. 用户查询 (`internal/repository/user.go`)

**修改方法**：

- `CountNewUsersByTimeRange()`
- `CountActiveUsersByTimeRange()`

**实现逻辑**：

```go
// 支持设备类型过滤：通过 activated_devices 表关联
if deviceType, ok := filters["device_type"]; ok {
    if dt, ok2 := deviceType.(string); ok2 && dt != "" {
        // 使用子查询：从 activated_devices 中筛选符合 device_type 的用户ID
        query = query.Where("id IN (?)",
            r.GetDB(ctx).Table("activated_devices").
                Select("unnest(registered_user_ids)").
                Where("device_type = ?", dt))
    }
}
```

**关键点**：

- 使用 `activated_devices` 表作为关联表
- `registered_user_ids` 是 PostgreSQL 数组字段，使用 `unnest()` 展开
- 通过 `device_type` 字段过滤（'android' 或 'ios'）

#### 2. 订单查询 (`internal/repository/order.go`)

**修改方法**：

- `CountOrdersByTimeRange()`
- `SumRevenueByTimeRange()`

**实现逻辑**：

```go
// 支持设备类型过滤：通过 activated_devices 表关联
if deviceType, ok := filters["device_type"]; ok {
    if dt, ok2 := deviceType.(string); ok2 && dt != "" {
        // 订单关联用户，用户ID在 activated_devices 的 registered_user_ids 数组中
        query = query.Where("user_id IN (?)",
            db.Table("activated_devices").
                Select("unnest(registered_user_ids)").
                Where("device_type = ?", dt))
    }
}
```

**数据关联链路**：

```
activated_devices (device_type, registered_user_ids[])
    ↓
users (id)
    ↓
orders (user_id)
```

## 🗄️ 数据库表结构

### activated_devices 表

| 字段                  | 类型         | 说明                      |
| --------------------- | ------------ | ------------------------- |
| `device_type`         | varchar(20)  | 设备类型：'android'/'ios' |
| `device_id`           | varchar(100) | 设备ID                    |
| `registered_user_ids` | bigint[]     | 关联的用户ID数组          |
| `channel_name`        | varchar(100) | 渠道包名称                |
| `created_at`          | timestamp    | 创建时间                  |

**关键特性**：

- `device_type` + `device_id` 组合唯一索引
- `registered_user_ids` 是 PostgreSQL 数组类型，存储多个用户ID
- 作为设备和用户的关联表

## 📊 数据流程

### 前端请求流程

```
用户选择操作系统
    ↓
selectedOS.value = 'android' | 'ios' | undefined
    ↓
handleOSChange() 触发
    ↓
loadData() 重新加载数据
    ↓
useDistributorBoard.loadData()
    ↓
构造 ReportRequest:
  {
    filters: {
      channel_names: [...],
      device_type: 'android' // 新增
    }
  }
    ↓
POST /analyse/report
```

### 后端处理流程

```
接收 filters.device_type
    ↓
report_service.GenerateReport()
    ↓
并行查询 modules: ['users', 'orders']
    ↓
users module:
  - userRepo.CountNewUsersByTimeRange()
  - 子查询 activated_devices 获取符合条件的 user_ids
  - 筛选用户
    ↓
orders module:
  - orderRepo.CountOrdersByTimeRange()
  - orderRepo.SumRevenueByTimeRange()
  - 子查询 activated_devices 获取符合条件的 user_ids
  - 筛选订单
    ↓
合并结果返回
```

## 🔍 SQL 查询示例

### 用户查询

```sql
SELECT COUNT(*)
FROM users
WHERE created_at >= ? AND created_at < ?
  AND id IN (
    SELECT unnest(registered_user_ids)
    FROM activated_devices
    WHERE device_type = 'android'
  );
```

### 订单查询

```sql
SELECT COUNT(*)
FROM orders
WHERE created_at >= ? AND created_at < ?
  AND user_id IN (
    SELECT unnest(registered_user_ids)
    FROM activated_devices
    WHERE device_type = 'ios'
  );
```

### 收入统计

```sql
SELECT COALESCE(SUM(amount), 0)
FROM orders
WHERE created_at >= ? AND created_at < ?
  AND payment_status = 'paid'
  AND user_id IN (
    SELECT unnest(registered_user_ids)
    FROM activated_devices
    WHERE device_type = 'android'
  );
```

## ✅ 功能特性

### 1. 筛选选项

- **全部**：不添加 `device_type` 过滤，显示所有平台数据
- **安卓**：`device_type = 'android'`，只显示安卓用户数据
- **iOS**：`device_type = 'ios'`，只显示iOS用户数据

### 2. 影响范围

- ✅ 激活数（install_count）
- ✅ 注册数（new_users）
- ✅ 订单数（order_count）
- ✅ 付费金额（total_revenue）
- ✅ 看板汇总数据
- ✅ 每日详细数据
- ✅ Excel 导出数据

### 3. 兼容性

- 与现有的渠道包筛选（channel_names）组合使用
- 与时间范围筛选组合使用
- 与分销商筛选（管理员看板）组合使用

### 4. 性能优化

- 使用子查询而非 JOIN，减少数据传输
- `device_type` 字段有索引支持
- `unnest()` 函数在 PostgreSQL 中性能良好

## 🧪 测试建议

### 1. 前端测试

```bash
# 渠道商看板
http://localhost:5555/distributor/board

# 管理员看板
http://localhost:5555/data-board/distributor
```

**测试步骤**：

1. 选择"全部" → 验证显示所有数据
2. 选择"安卓" → 验证只显示安卓用户数据
3. 选择"iOS" → 验证只显示iOS用户数据
4. 导出数据 → 验证Excel包含正确的筛选结果

### 2. 后端测试

```bash
# 测试 API
curl -X POST http://localhost:8080/api/analyse/report \
  -H "Content-Type: application/json" \
  -d '{
    "granularity": "day",
    "start_time": "2024-10-01T00:00:00Z",
    "end_time": "2024-10-23T23:59:59Z",
    "modules": ["users", "orders"],
    "metrics": [
      {"name": "install_count", "type": "count"},
      {"name": "new_users", "type": "count"},
      {"name": "order_count", "type": "count"},
      {"name": "total_revenue", "type": "sum", "field": "amount"}
    ],
    "filters": {
      "device_type": "android"
    },
    "include_total": true
  }'
```

### 3. 数据验证

```sql
-- 验证 activated_devices 数据
SELECT device_type, COUNT(*) as device_count
FROM activated_devices
GROUP BY device_type;

-- 验证用户关联
SELECT
  ad.device_type,
  COUNT(DISTINCT unnest(ad.registered_user_ids)) as user_count
FROM activated_devices ad
GROUP BY ad.device_type;

-- 验证订单关联
SELECT
  ad.device_type,
  COUNT(o.id) as order_count,
  SUM(o.amount) as total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN activated_devices ad ON u.id = ANY(ad.registered_user_ids)
WHERE o.payment_status = 'paid'
GROUP BY ad.device_type;
```

## 📝 注意事项

### 1. 数据完整性

- 确保 `activated_devices` 表中 `registered_user_ids` 数组正确维护
- 新用户注册时需要更新对应设备的 `registered_user_ids`
- 支持一个设备关联多个用户ID（数组存储）

### 2. 性能考虑

- `device_type` 字段建议添加索引（如果还没有）
- 大数据量时考虑使用物化视图或缓存
- 子查询结果集不宜过大

### 3. 边界情况

- 用户未关联任何设备 → 不会被筛选（任何OS选项都不会包含）
- 用户关联多个设备（android + ios）→ 会在两个选项中都出现
- `device_type` 为空或未知值 → 被视为"全部"

### 4. 扩展性

- 如需支持更多平台（如 web, pc），只需添加新的选项
- `device_type` 字段支持任意字符串值
- 前端选项可从后端动态获取

## 🎓 技术要点

### PostgreSQL 数组操作

```sql
-- unnest: 数组展开为行
SELECT unnest(ARRAY[1,2,3]);
-- 结果：
-- 1
-- 2
-- 3

-- ANY: 数组包含检查
SELECT * FROM users WHERE id = ANY(ARRAY[1,2,3]);

-- @>: 数组包含运算符
SELECT * FROM activated_devices WHERE registered_user_ids @> ARRAY[123];
```

### GORM 子查询

```go
db.Where("id IN (?)",
    db.Table("other_table").
        Select("column").
        Where("condition = ?", value))
```

## 📊 影响分析

### 修改文件清单

**前端** (3个文件):

1. `apps/web-antd/src/views/distributor/board/index.vue` - 渠道商看板
2. `apps/web-antd/src/views/data-board/distributor/index.vue` - 管理员看板
3. `apps/web-antd/src/composables/useDistributorBoard.ts` - 通用Hook

**后端** (2个文件):

1. `internal/repository/user.go` - 用户查询
2. `internal/repository/order.go` - 订单查询

### 向后兼容性

✅ 完全兼容：

- 不传 `device_type` 时，行为与之前完全相同
- 前端旧版本不传该参数，后端自动忽略
- 不影响其他模块和功能

## 🚀 部署建议

### 前端部署

```bash
cd /Users/qingyuan/qingyuaner/vue-vben-admin/apps/web-antd
pnpm build
```

### 后端部署

```bash
cd /Users/qingyuan/qingyuaner/mahjong-backend
go build -o bin/admin_backend cmd/admin_backend/*.go
```

### 检查清单

- [ ] 前端代码无 lint 错误
- [ ] 后端代码编译通过
- [ ] 数据库连接正常
- [ ] activated_devices 表有数据
- [ ] API 返回正确的筛选结果
- [ ] 前端UI正常显示选择框
- [ ] 导出功能包含筛选条件

---

**实现时间**: 2025-10-23  
**版本**: 1.0  
**状态**: ✅ 已完成
