# Web Agent - Vue 3 版本

这是从 React 版本的 agent-web 迁移而来的 Vue 3 应用，用于代理商会员充值管理。

## 特性

- ✅ 完整的 Authing 认证集成
- ✅ 会员充值功能（VIP/SVIP，1/3/7/30天）
- ✅ 库存管理查看
- ✅ 充值记录查询和撤销
- ✅ 代理合作信息展示
- ✅ 100% UI 还原（移动端优先）
- ✅ 支持多 domain 的网络请求层

## ⚠️ 重要提示

### 关于依赖构建问题

本项目依赖 monorepo 中的 `@vben-core/shared` 等包。每次运行 `pnpm install` 后，monorepo 的 `postinstall` 钩子会将这些包构建为 **stub 版本**（开发用），这些 stub 文件使用 Node.js 专用的 `jiti` 模块，**不能用于浏览器生产构建**。

**已自动解决**：

- ✅ `package.json` 中的 `prebuild` 脚本会在构建前自动构建依赖
- ✅ 运行 `pnpm build` 时无需手动操作

**如遇构建错误**（显示 jiti 相关错误），手动执行：

```bash
pnpm --filter @vben-core/shared build
```

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由**: Vue Router
- **状态管理**: Pinia
- **HTTP客户端**: @vben/request（基于 Axios）
- **认证**: Authing SDK
- **样式**: CSS Variables + Scoped CSS

## 目录结构

```
apps/web-agent/
├── src/
│   ├── api/              # API 层
│   │   ├── agent.ts     # 代理商 API
│   │   ├── request.ts   # 请求客户端配置
│   │   └── types.ts     # API 类型定义
│   ├── views/            # 页面组件
│   │   ├── home/        # 主页（会员充值）
│   │   ├── inventory/   # 库存页
│   │   ├── sale-records/ # 充值记录页
│   │   └── auth/        # 认证相关页面
│   ├── components/       # 通用组件
│   │   └── Toast.vue    # Toast 提示组件
│   ├── composables/      # Vue Composables
│   │   ├── useAuthingClient.ts
│   │   └── useMemberRecharge.ts
│   ├── services/         # 业务服务层
│   │   └── member/      # 会员服务
│   ├── styles/           # 样式文件
│   ├── router/           # 路由配置
│   ├── store/            # Pinia stores
│   ├── app.vue
│   └── main.ts
├── public/
│   └── assets/          # 静态资源
├── package.json
├── vite.config.mts
└── tsconfig.json
```

## 环境配置

在运行前，需要配置以下环境变量（创建 `.env.development` 文件）：

```bash
# 应用标题
VITE_APP_TITLE=AI扑克代理平台

# 代理 API URL
VITE_AGENT_API_URL=http://localhost:5174/api

# Authing 配置
VITE_AUTHING_APP_ID=your_app_id_here
VITE_AUTHING_APP_SECRET=your_app_secret_here
VITE_AUTHING_APP_HOST=https://your-app.authing.cn
VITE_AUTHING_REDIRECT_URI=http://localhost:5174/callback
VITE_AUTHING_LOGOUT_REDIRECT_URI=http://localhost:5174/
```

## 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

## 开发

```bash
# 启动开发服务器
cd apps/web-agent
pnpm dev
```

应用将在 `http://localhost:5174` 启动。

## 构建

```bash
# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 环境变量配置

### 创建环境变量文件

项目使用环境变量管理配置。已提供模板文件：

- `.env.example` - 环境变量模板
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 配置步骤

1. 复制模板创建本地配置：

   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入真实配置：

   ```env
   VITE_AUTHING_APP_ID=你的应用ID
   VITE_AUTHING_APP_SECRET=你的应用密钥
   VITE_AUTHING_APP_HOST=https://xxx.authing.cn
   VITE_AUTHING_REDIRECT_URI=http://localhost:5174/callback
   VITE_AUTHING_LOGOUT_REDIRECT_URI=http://localhost:5174/logout-callback
   VITE_API_BASE_URL=/api
   VITE_APP_TITLE=AI扑克代理平台
   ```

3. `.env.local` 已被 `.gitignore` 忽略，不会提交

### 环境变量说明

| 变量名                             | 说明               |
| ---------------------------------- | ------------------ |
| `VITE_AUTHING_APP_ID`              | Authing 应用 ID    |
| `VITE_AUTHING_APP_SECRET`          | Authing 应用密钥   |
| `VITE_AUTHING_APP_HOST`            | Authing 用户池域名 |
| `VITE_AUTHING_REDIRECT_URI`        | 登录成功回调地址   |
| `VITE_AUTHING_LOGOUT_REDIRECT_URI` | 登出成功回调地址   |
| `VITE_API_BASE_URL`                | API 基础路径       |
| `VITE_APP_TITLE`                   | 应用标题           |

## API 配置

应用使用代理模式访问后端 API：

- 开发环境：`http://localhost:5174/api` → `http://localhost:8002`
- 生产环境：`/api` → 实际的后端 API 地址

在 `vite.config.mts` 中修改代理配置：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8002', // 修改为实际的后端地址
      changeOrigin: true,
    },
  },
}
```

## 主要功能

### 1. 认证流程

- `/login-buffer` - 登录缓冲页（展示登录按钮和代理合作信息）
- `/login` - 自动跳转到 Authing 登录页
- `/callback` - 处理 Authing 认证回调
- `/logout-callback` - 处理登出回调

### 2. 会员充值

- 选择会员类型（VIP/SVIP）
- 选择有效期（月卡/7天/3天/1天\*）
  - \*1天选项仅对管理员可见
- 输入8位用户 ID
- 确认充值信息
- 执行充值操作

### 3. 库存管理

- 查看不同类型会员卡的库存数量
- 实时显示库存状态

### 4. 充值记录

- 查看历史充值记录
- 撤销24小时内的充值订单

## 与 React 版本的差异

### 技术层面

| 特性     | React 版本                   | Vue 版本              |
| -------- | ---------------------------- | --------------------- |
| 状态管理 | useState/useContext          | Pinia                 |
| 生命周期 | useEffect                    | onMounted/onUnmounted |
| 路由     | React Router                 | Vue Router            |
| HTTP     | 自定义 HttpClient            | @vben/request         |
| 条件渲染 | {condition && <Component />} | v-if                  |
| 事件绑定 | onClick                      | @click                |

### UI 层面

- **100% 像素级还原**：所有颜色、间距、字体、布局完全一致
- **CSS 变量复用**：保持原有的 primary 和 basic 色系
- **移动端优先**：响应式设计保持不变

## 开发注意事项

### 1. 样式导入

使用 `src="@/styles/xxx.css"` 导入样式：

```vue
<style scoped src="@/styles/home.css"></style>
```

### 2. 路径别名

- `#/*` 映射到 `src/*`
- `@/*` 映射到 `src/*`

### 3. 类型安全

所有 API 和组件都有完整的 TypeScript 类型定义。

### 4. Authing 集成

使用 `useAuthingClient` composable 获取 Authing 客户端实例：

```typescript
import { useAuthingClient } from '#/composables/useAuthingClient';

const authingClient = useAuthingClient();
const loginUrl = authingClient.buildLoginUrl();
```

## 故障排查

### 1. 认证失败

- 检查 `.env` 文件中的 Authing 配置是否正确
- 确认 `VITE_AUTHING_REDIRECT_URI` 与 Authing 控制台配置一致

### 2. API 请求失败

- 检查后端服务是否运行在正确的端口
- 检查 vite.config.mts 中的代理配置
- 查看浏览器控制台的网络请求

### 3. 样式问题

- 确认所有 CSS 文件已正确复制到 `src/styles/`
- 确认静态资源已复制到 `public/assets/`

## 与 web-antd 的区别

web-agent 是一个独立的应用，与 web-antd 的主要区别：

| 特性   | web-agent             | web-antd              |
| ------ | --------------------- | --------------------- |
| 用途   | 代理商充值管理        | 管理后台              |
| UI风格 | 移动端优先            | 桌面端管理后台        |
| 认证   | Authing               | 可配置多种认证方式    |
| 端口   | 5174                  | 5173                  |
| API    | http://localhost:8002 | http://localhost:8001 |

两个应用可以同时运行，互不影响。

## License

MIT
