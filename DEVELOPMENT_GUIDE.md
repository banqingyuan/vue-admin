# Vue Vben Admin 继续开发规范

> 适用范围：本仓库 Monorepo（apps、packages、internal、docs、playground）。针对团队在此基础上持续开发与交付的约定与最佳实践。

## 1. 基础设施与运行

- Node 版本：≥ 20.10；包管理器：pnpm（根 `package.json` 已锁定 `packageManager`）
- 安装：`npm i -g corepack && pnpm install`
- 开发启动：
  - 整体：`pnpm dev`
  - 单应用：`pnpm dev:naive | dev:antd | dev:ele | dev:play | dev:docs`
- 构建：
  - 整体：`pnpm build`
  - 单应用：`pnpm build:naive | build:antd | build:ele | build:docs | build:play`
- Mock 后端：默认由 Vite 集成代理到 `apps/backend-mock`，也可独立 `pnpm -F @vben/backend-mock start`

## 2. 代码组织与模块边界

- Monorepo 结构：
  - `apps/*`：具体应用（web-naive/web-antd/web-ele/backend-mock）
  - `packages/*`：可复用能力（access、request、layouts、locales、stores、styles、utils、types、icons、preferences 等）
  - `internal/*`：内部构建与工具链（vite-config、tsconfig、lint-configs 等）
  - `docs/`：文档站（VitePress）
  - `playground/`：试验场（验证组件/交互/API）
- 原则：
  - 业务无关的能力沉淀于 `packages`，跨 app 复用；
  - 应用内仅保留样式皮肤、适配层与路由/页面；
  - 公共类型统一放在 `@vben/types`；公共常量统一放在 `@vben/constants`；
  - 避免 app 间直接互引，始终通过 `@vben/*` 包暴露。

## 3. 代码风格与质量

- Lint/Format：执行 `pnpm lint`、`pnpm format`；提交前必须无错误。
- TypeScript：
  - 导出/公共 API 必须显式类型标注；
  - 不使用 `any`/`as any` 逃逸；
  - 避免深层可空链式访问导致的隐藏分支，必要时使用类型收窄。
- 结构：遵循“早返回、少嵌套”；异常必带有效上下文；避免无意义的 try/catch。
- 命名：语义化、全词拼写（函数动词短语，变量名名词短语）。

## 4. Git 与提交规范

- 分支：`feat/*`、`fix/*`、`docs/*`、`refactor/*`、`chore/*`、`test/*`
- 提交信息：遵循 Conventional Commits（已集成 `czg`）；示例：
  - `feat(request): support file upload progress`
  - `fix(access): avoid route duplication on relogin`
- 变更集：使用 Changesets（`pnpm changeset` / `pnpm version`）。

## 5. 环境与配置

- 环境变量：
  - 应用层常用：`VITE_APP_TITLE`、`VITE_BASE`、`VITE_ROUTER_HISTORY`、`VITE_APP_VERSION`、`VITE_APP_NAMESPACE`、`VITE_APP_STORE_SECURE_KEY`
  - 全局注入：`VITE_GLOB_API_URL`、（可选）钉钉登录相关变量
- 偏好设置：应用内通过 `src/preferences.ts` 使用 `defineOverridesPreferences` 覆盖（名称、主题、布局、开关）。
- 代理：各 app `vite.config.mts` 中维护 `/api` 代理与本地 mock 目标。

## 6. 路由与权限

- 路由：放在 `apps/*/src/router`，`routes/modules` 按功能拆分；
- 基础路由：`routes/core.ts`，无需鉴权；
- 守卫：`router/guard.ts`，按顺序注册“通用守卫 → 权限守卫”；
- 权限：通过 `@vben/access` 统一生成菜单与动态路由（支持 frontend/backend/mixed 模式），APP 侧通过 `router/access.ts` 配置 `layoutMap`、`pageMap` 与 `fetchMenuListAsync`；
- 角色/码：登录后写入 `@vben/stores` 的 `access`、`user` 模块，`isAccessChecked` 用于避免重复生成路由。

## 7. 状态管理（Pinia）

- 初始化：在 `bootstrap.ts` 调用 `initStores(app, { namespace })`；
- 持久化：开发态 `localStorage`，生产态 `secure-ls` AES 加密，key 前缀为 `namespace`；
- Store 设计：
  - 公共模块：沉淀至 `packages/stores/src/modules/*`；
  - 应用专属：放在 `apps/*/src/store` 并以 `export *` 暴露；
  - 提供 `$reset`，在登出或切换用户时统一清理；
  - 变更必须通过 action，避免直接写 state。

## 8. 请求与错误处理

- 客户端：使用 `@vben/request` 的 `RequestClient`；
- 统一拦截：
  - 请求头注入 `Authorization` 与 `Accept-Language`；
  - 响应解析 `code/data`（默认成功码 0）；
  - 401 自动刷新或触发重新认证（按偏好设置 modal/redirect）；
  - 通用错误转化为用户可读消息（可结合 UI 库的 message 组件）。
- API 封装：`apps/*/src/api` 下按域划分（auth/menu/user/...），返回值类型化。

## 9. 国际化（i18n）

- 使用 `@vben/locales`，默认语言 `zh-CN`；
- 语言包以目录分组并动态加载，新增文案需在对应 `langs/<locale>/*.json` 中维护；
- 路由 meta 的标题统一用 `$t('...')`，布局中会根据偏好设置动态更新标题。

## 10. 布局与 UI 适配

- 优先使用 `@vben/layouts` 与 `@vben/common-ui` 的现成组件；
- 新增 UI 适配层：放 `apps/*/src/adapter`（表单/表格/组件库定制）；
- 样式：共用样式放 `@vben/styles`，应用特定样式放各自 app 的样式目录。

## 11. 图表规范

- 默认用 `@vben/plugins/echarts`（`EchartsUI` + `useEcharts`）；
- 新增图表共性封装写在 `packages/effects/plugins`，避免三端重复；
- 若引入 G2/G2Plot 等，保持插件式封装与主题/尺寸响应特性一致。

## 12. 测试与验证

- 单测：Vitest（`pnpm test:unit`），优先覆盖公共包；
- E2E：Playwright（playground/或应用关键路径）；
- 新增/修改公共能力时，提供最小复现于 `playground`。

## 13. 性能与可维护性

- 路由与组件懒加载；
- 严禁无条件大对象深拷贝与频繁 reactivity 抖动；
- 公共能力注重文档与示例（docs + playground），降低心智负担。

## 14. 提交流程

1. 本地开发与验证（含 lint、typecheck、单测）
2. 创建 changeset 并提交：`pnpm changeset`
3. 推送分支与 PR，自检通过后请求评审
4. 合并后由 CI 构建与发布（必要时）

## 15. 常见约定

- 业务路由放 `routes/modules`，名称唯一；
- 组件命名与路由 name 同步，利于 keep-alive；
- 权限受控页面必须明确 meta（如 `title`、`icon`、`order`、`keepAlive`）。

---

如需团队约束更严格（例如 import 顺序、文件命名策略、commit 策略细节等），请在 `internal/lint-configs` 或 `.cursorrules` 中扩展。
