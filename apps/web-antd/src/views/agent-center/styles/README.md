# Agent Center 颜色系统使用指南

## 概述

这是代理中心（Agent Center）模块的统一颜色系统，用于确保所有页面的视觉一致性。

## 使用方法

### 1. 引入颜色系统

在你的 Vue 组件中引入颜色系统：

```vue
<style scoped>
@import './styles/colors.css';

/* 然后就可以使用CSS变量了 */
.my-component {
  background: var(--agent-bg-card);
  color: var(--agent-text-primary);
  border: 1px solid var(--agent-border-primary);
}
</style>
```

### 2. 颜色变量分类

#### 主色调（金色系）
- `--agent-primary`: #d9a34e - 主要交互色
- `--agent-primary-hover`: #f0b860 - hover状态
- `--agent-primary-light`: rgba(217, 163, 78, 0.1) - 浅色背景
- `--agent-primary-border`: rgba(217, 163, 78, 0.3) - 边框色
- `--agent-primary-border-hover`: rgba(217, 163, 78, 0.6) - hover边框

#### 背景色
- `--agent-bg-primary`: #000000 - 主背景
- `--agent-bg-secondary`: #141414 - 次级背景
- `--agent-bg-card`: #1a1a1a - 卡片背景
- `--agent-bg-input`: #141414 - 输入框背景
- `--agent-bg-overlay`: rgba(0, 0, 0, 0.85) - 遮罩背景

#### 文字颜色
- `--agent-text-primary`: #ffffff - 主要文字
- `--agent-text-secondary`: #8c8c8c - 次要文字
- `--agent-text-tertiary`: #595959 - 三级文字
- `--agent-text-disabled`: #434343 - 禁用文字

#### 边框颜色
- `--agent-border-primary`: #595959 - 主要边框
- `--agent-border-secondary`: #434343 - 次要边框
- `--agent-border-light`: #2a2a2a - 浅色边框

#### 状态颜色
- `--agent-success`: #52c41a - 成功
- `--agent-warning`: #faad14 - 警告
- `--agent-error`: #ff6e6b - 错误
- `--agent-info`: #1890ff - 信息
- `--agent-pending`: #faad14 - 待处理
- `--agent-rejected`: #ff4d4f - 已驳回
- `--agent-approved`: #52c41a - 已通过

### 3. 常用样式示例

#### 卡片样式
```css
.card {
  background: var(--agent-bg-card);
  border: 1px solid var(--agent-border-primary);
  border-radius: var(--agent-radius-lg);
  padding: var(--agent-space-xxl);
}
```

#### 按钮样式（金色主按钮）
```css
.btn-primary {
  background: transparent;
  border: 1px solid var(--agent-primary-border);
  color: var(--agent-primary);
  border-radius: var(--agent-radius-sm);
  transition: var(--agent-transition-normal);
}

.btn-primary:hover {
  background: rgba(217, 163, 78, 0.1);
  border-color: var(--agent-primary);
  color: var(--agent-primary-hover);
}
```

#### 输入框样式
```css
.input {
  background: var(--agent-bg-input);
  border: 1px solid var(--agent-border-primary);
  border-radius: var(--agent-radius-lg);
  color: var(--agent-text-primary);
  padding: 10px 12px;
  font-family: var(--agent-font-family);
}

.input:hover {
  border-color: var(--agent-primary);
}

.input:focus {
  border-color: var(--agent-primary);
  box-shadow: var(--agent-shadow-focus);
}
```

#### 状态标签
```css
/* 待处理 */
.tag-pending {
  color: var(--agent-pending);
  background: var(--agent-pending-bg);
  border: 1px solid var(--agent-pending);
}

/* 已通过 */
.tag-approved {
  color: var(--agent-approved);
  background: var(--agent-approved-bg);
  border: 1px solid var(--agent-approved);
}

/* 已驳回 */
.tag-rejected {
  color: var(--agent-rejected);
  background: var(--agent-rejected-bg);
  border: 1px solid var(--agent-rejected);
}
```

#### 代理等级标签
```css
/* 高级代理 */
.level-high {
  color: var(--agent-level-high);
  background: var(--agent-level-high-bg);
  border: 1px solid var(--agent-level-high);
}

/* 普通代理 */
.level-normal {
  color: var(--agent-level-normal);
  background: var(--agent-level-normal-bg);
  border: 1px solid var(--agent-level-normal);
}
```

### 4. 工具类使用

系统提供了一些快捷的工具类：

```html
<!-- 文字颜色 -->
<div class="agent-text-primary">主要文字</div>
<div class="agent-text-secondary">次要文字</div>
<div class="agent-text-gold">金色文字</div>
<div class="agent-text-success">成功文字</div>
<div class="agent-text-error">错误文字</div>

<!-- 背景颜色 -->
<div class="agent-bg-primary">主背景</div>
<div class="agent-bg-card">卡片背景</div>

<!-- 状态标签 -->
<span class="agent-tag-pending">待处理</span>
<span class="agent-tag-approved">已通过</span>
<span class="agent-tag-rejected">已驳回</span>

<!-- 等级标签 -->
<span class="agent-tag-level-high">高级代理</span>
<span class="agent-tag-level-normal">代理</span>
```

## 迁移指南

### 替换硬编码颜色

**旧代码：**
```css
.element {
  background: #141414;
  color: #ffffff;
  border: 1px solid #595959;
}
```

**新代码：**
```css
.element {
  background: var(--agent-bg-secondary);
  color: var(--agent-text-primary);
  border: 1px solid var(--agent-border-primary);
}
```

### 常见颜色映射表

| 旧颜色值 | CSS变量 | 用途 |
|---------|---------|------|
| #d9a34e | --agent-primary | 金色主色 |
| #f0b860 | --agent-primary-hover | 金色hover |
| #000000 | --agent-bg-primary | 主背景 |
| #141414 | --agent-bg-secondary | 次级背景 |
| #1a1a1a | --agent-bg-card | 卡片背景 |
| #ffffff | --agent-text-primary | 主要文字 |
| #8c8c8c | --agent-text-secondary | 次要文字 |
| #595959 | --agent-border-primary | 主要边框 |
| #434343 | --agent-border-secondary | 次要边框 |
| #52c41a | --agent-success | 成功状态 |
| #faad14 | --agent-warning | 警告状态 |
| #ff6e6b | --agent-error | 错误状态 |
| #1890ff | --agent-info | 信息状态 |

## 最佳实践

1. **始终使用CSS变量**，不要硬编码颜色值
2. **使用语义化的变量名**，如 `--agent-text-primary` 而不是 `--agent-white`
3. **保持一致性**，相同功能的元素使用相同的颜色变量
4. **响应式设计**，可以在不同断点下调整颜色变量的值
5. **主题切换**，通过修改CSS变量的值可以轻松实现主题切换

## 扩展说明

如果需要添加新的颜色变量，请遵循以下命名规范：

```css
/* 格式：--agent-[类别]-[语义] */
--agent-bg-new: #color;      /* 背景类 */
--agent-text-new: #color;    /* 文字类 */
--agent-border-new: #color;  /* 边框类 */
--agent-status-new: #color;  /* 状态类 */
```

## 维护

当需要调整整体配色方案时，只需要在 `colors.css` 文件中修改对应的CSS变量值，所有使用该变量的地方都会自动更新。

---

**版本**: 1.0.0  
**最后更新**: 2024

