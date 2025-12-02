# Agent Center 统一颜色系统

## 📋 目录结构

```
/views/agent-center/styles/
├── colors.css              # 颜色系统主文件（CSS变量定义）
├── README.md               # 使用指南
├── migration-example.md    # 迁移示例
└── index.md               # 本文档（总览）
```

## 🎨 颜色系统概述

这是一套为代理中心（Agent Center）模块设计的统一颜色系统，旨在：

- ✅ **统一视觉风格**：所有页面使用相同的配色方案
- ✅ **易于维护**：集中管理颜色，修改一处即可全局生效
- ✅ **语义化命名**：使用有意义的变量名，提高代码可读性
- ✅ **主题扩展**：支持轻松切换主题或添加新主题
- ✅ **响应式友好**：可根据不同场景调整颜色

## 🚀 快速开始

### 1. 在组件中引入

```vue
<style scoped>
@import './styles/colors.css';

.my-component {
  background: var(--agent-bg-card);
  color: var(--agent-text-primary);
  border: 1px solid var(--agent-border-primary);
}
</style>
```

### 2. 使用工具类

```html
<span class="agent-tag-pending">待处理</span>
<span class="agent-tag-approved">已通过</span>
<div class="agent-text-gold">金色文字</div>
```

### 3. 常用颜色速查

| 用途 | CSS变量 | 颜色值 |
|-----|---------|--------|
| 金色主色 | `--agent-primary` | #d9a34e |
| 主背景 | `--agent-bg-primary` | #000000 |
| 卡片背景 | `--agent-bg-card` | #1a1a1a |
| 主要文字 | `--agent-text-primary` | #ffffff |
| 次要文字 | `--agent-text-secondary` | #8c8c8c |
| 主要边框 | `--agent-border-primary` | #595959 |
| 成功色 | `--agent-success` | #52c41a |
| 警告色 | `--agent-warning` | #faad14 |
| 错误色 | `--agent-error` | #ff6e6b |

## 📚 文档导航

### [使用指南](./README.md)
详细的使用说明，包括：
- 所有颜色变量的完整列表
- 常用样式示例
- 工具类使用方法
- 最佳实践

### [迁移示例](./migration-example.md)
现有页面迁移到统一颜色系统的示例，包括：
- 完整的迁移案例
- 批量替换正则表达式
- 迁移检查清单
- 常见问题解答

## 🎯 设计原则

### 1. 暗黑主题
整体采用暗黑主题设计，主背景为纯黑 (#000000)，卡片和输入框使用深灰色系。

### 2. 金色点缀
使用金色 (#d9a34e) 作为主要交互色，体现高端、专业的品牌调性。

### 3. 语义化状态
明确的状态颜色体系：
- 🟢 绿色 (#52c41a) - 成功/已通过
- 🟡 黄色 (#faad14) - 警告/待处理
- 🔴 红色 (#ff6e6b) - 错误/已驳回
- 🔵 蓝色 (#1890ff) - 信息/普通代理

### 4. 层级分明
通过不同的灰度来区分文字和元素的层级：
- 主要文字：#ffffff
- 次要文字：#8c8c8c
- 三级文字：#595959
- 禁用文字：#434343

## 🔧 维护指南

### 添加新颜色

如需添加新的颜色变量，请在 `colors.css` 中按照以下格式添加：

```css
/* 在对应的分类下添加 */
:root {
  /* 背景色 */
  --agent-bg-new: #color;
  
  /* 文字颜色 */
  --agent-text-new: #color;
  
  /* 状态颜色 */
  --agent-status-new: #color;
  --agent-status-new-bg: rgba(...);
  --agent-status-new-border: rgba(...);
}
```

### 修改现有颜色

直接在 `colors.css` 中修改对应变量的值，所有使用该变量的地方会自动更新。

### 版本控制

重大颜色变更请记录版本号和变更说明：

```css
/**
 * Agent Center 统一颜色系统
 * 版本: 1.1.0
 * 变更: 2024-XX-XX - 调整金色主色的亮度
 */
```

## 📦 应用范围

该颜色系统适用于以下页面：

- ✅ `/agent-center/overview` - 数据概览
- ✅ `/agent-center/promoters` - 代理列表
- ✅ `/agent-center/onboarding-review` - 入驻审核
- ✅ `/agent-center/withdraw-review` - 提现审核
- ✅ `/agent-center/modes` - 模式管理

## 🎨 视觉规范

### 间距规范
使用统一的间距变量：
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- xxl: 24px

### 圆角规范
- sm: 4px（按钮、标签）
- md: 8px（小卡片）
- lg: 12px（输入框、常规卡片）
- xl: 16px（大卡片）

### 阴影规范
- sm: 轻微阴影
- md: 中等阴影
- lg: 明显阴影
- focus: 焦点阴影（金色）

## 🔗 相关资源

- [Figma 设计稿](https://www.figma.com/design/...)
- [Ant Design 文档](https://ant.design/)
- [CSS 变量 MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)

## 📞 联系与反馈

如有任何问题或建议，请联系：
- 团队负责人：xxx
- 设计师：xxx
- 邮箱：xxx@example.com

---

**版本**: 1.0.0  
**创建日期**: 2024  
**最后更新**: 2024

