# 颜色系统迁移示例

## 完整迁移示例

以下是将现有页面迁移到统一颜色系统的完整示例：

### 1. 卡片组件迁移

**迁移前：**

```vue
<style scoped>
.detail-card {
  background: #1a1a1a;
  border: 1px solid #595959;
  border-radius: 12px;
  padding: 24px;
}

.card-title {
  color: #ffffff;
  font-size: 16px;
}
</style>
```

**迁移后：**

```vue
<style scoped>
@import './styles/colors.css';

.detail-card {
  background: var(--agent-bg-card);
  border: 1px solid var(--agent-border-primary);
  border-radius: var(--agent-radius-lg);
  padding: var(--agent-space-xxl);
}

.card-title {
  color: var(--agent-text-primary);
  font-size: var(--agent-font-size-md);
}
</style>
```

### 2. 按钮组件迁移

**迁移前：**

```vue
<style scoped>
.action-btn {
  background: transparent;
  border: 1px solid rgba(217, 163, 78, 0.3);
  color: #d9a34e;
  border-radius: 4px;
}

.action-btn:hover {
  background: rgba(217, 163, 78, 0.1);
  border-color: #d9a34e;
  color: #f0b860;
}
</style>
```

**迁移后：**

```vue
<style scoped>
@import './styles/colors.css';

.action-btn {
  background: transparent;
  border: 1px solid var(--agent-primary-border);
  color: var(--agent-primary);
  border-radius: var(--agent-radius-sm);
  transition: var(--agent-transition-normal);
}

.action-btn:hover {
  background: var(--agent-primary-light);
  border-color: var(--agent-primary);
  color: var(--agent-primary-hover);
}
</style>
```

### 3. 表单输入框迁移

**迁移前：**

```vue
<style scoped>
.field-value {
  background: #141414;
  border: 1px solid #595959;
  border-radius: 12px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 16px;
  line-height: 24px;
  font-family: 'PingFang SC', sans-serif;
  min-height: 44px;
}

.field-value:hover {
  border-color: #d9a34e;
}

.field-value:focus {
  border-color: #d9a34e;
  box-shadow: 0 0 0 2px rgba(217, 163, 78, 0.1);
}
</style>
```

**迁移后：**

```vue
<style scoped>
@import './styles/colors.css';

.field-value {
  background: var(--agent-bg-input);
  border: 1px solid var(--agent-border-primary);
  border-radius: var(--agent-radius-lg);
  padding: 10px 12px;
  color: var(--agent-text-primary);
  font-size: var(--agent-font-size-md);
  line-height: 24px;
  font-family: var(--agent-font-family);
  min-height: 44px;
}

.field-value:hover {
  border-color: var(--agent-primary);
}

.field-value:focus {
  border-color: var(--agent-primary);
  box-shadow: var(--agent-shadow-focus);
}
</style>
```

### 4. 状态标签迁移

**迁移前：**

```vue
<style scoped>
.status-pending {
  color: #faad14;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid #faad14;
  padding: 4px 12px;
  border-radius: 4px;
}

.status-approved {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid #52c41a;
  padding: 4px 12px;
  border-radius: 4px;
}

.status-rejected {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
  padding: 4px 12px;
  border-radius: 4px;
}
</style>
```

**迁移后（方式1 - 使用CSS变量）：**

```vue
<style scoped>
@import './styles/colors.css';

.status-tag {
  padding: var(--agent-space-xs) var(--agent-space-md);
  border-radius: var(--agent-radius-sm);
}

.status-pending {
  color: var(--agent-pending);
  background: var(--agent-pending-bg);
  border: 1px solid var(--agent-pending);
}

.status-approved {
  color: var(--agent-approved);
  background: var(--agent-approved-bg);
  border: 1px solid var(--agent-approved);
}

.status-rejected {
  color: var(--agent-rejected);
  background: var(--agent-rejected-bg);
  border: 1px solid var(--agent-rejected);
}
</style>
```

**迁移后（方式2 - 使用工具类）：**

```vue
<template>
  <span class="agent-tag-pending">待处理</span>
  <span class="agent-tag-approved">已通过</span>
  <span class="agent-tag-rejected">已驳回</span>
</template>

<style scoped>
@import './styles/colors.css';
/* 不需要额外的CSS，直接使用工具类 */
</style>
```

### 5. 等级标签迁移

**迁移前：**

```vue
<style scoped>
.level-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-high {
  color: #d9a34e;
  background: rgba(217, 163, 78, 0.15);
  border: 1px solid #d9a34e;
}

.level-normal {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.15);
  border: 1px solid #1890ff;
}
</style>
```

**迁移后（方式1 - 使用CSS变量）：**

```vue
<style scoped>
@import './styles/colors.css';

.level-tag {
  padding: 2px var(--agent-space-sm);
  border-radius: var(--agent-radius-sm);
  font-size: var(--agent-font-size-xs);
}

.level-high {
  color: var(--agent-level-high);
  background: var(--agent-level-high-bg);
  border: 1px solid var(--agent-level-high);
}

.level-normal {
  color: var(--agent-level-normal);
  background: var(--agent-level-normal-bg);
  border: 1px solid var(--agent-level-normal);
}
</style>
```

**迁移后（方式2 - 使用工具类）：**

```vue
<template>
  <span class="agent-tag-level-high">高级代理</span>
  <span class="agent-tag-level-normal">代理</span>
</template>

<style scoped>
@import './styles/colors.css';
</style>
```

## 批量替换正则表达式

以下正则表达式可以帮助你快速替换常见的颜色值：

### VSCode 查找替换

1. **金色主色**
   - 查找: `#d9a34e`
   - 替换: `var(--agent-primary)`

2. **金色hover**
   - 查找: `#f0b860`
   - 替换: `var(--agent-primary-hover)`

3. **黑色背景**
   - 查找: `background:\s*#141414`
   - 替换: `background: var(--agent-bg-secondary)`

4. **白色文字**
   - 查找: `color:\s*#ffffff`
   - 替换: `color: var(--agent-text-primary)`

5. **灰色文字**
   - 查找: `color:\s*#8c8c8c`
   - 替换: `color: var(--agent-text-secondary)`

6. **边框颜色**
   - 查找: `border:\s*1px\s+solid\s+#595959`
   - 替换: `border: 1px solid var(--agent-border-primary)`

7. **金色透明边框**
   - 查找: `rgba\(217,\s*163,\s*78,\s*0\.3\)`
   - 替换: `var(--agent-primary-border)`

8. **圆角**
   - 查找: `border-radius:\s*12px`
   - 替换: `border-radius: var(--agent-radius-lg)`

9. **字体家族**
   - 查找: `font-family:\s*['"]PingFang SC['"],\s*sans-serif`
   - 替换: `font-family: var(--agent-font-family)`

## 迁移检查清单

- [ ] 所有硬编码的颜色值已替换为CSS变量
- [ ] 引入了 `colors.css` 文件
- [ ] 检查hover和focus状态的颜色
- [ ] 检查状态标签的颜色
- [ ] 检查按钮的颜色
- [ ] 检查边框颜色
- [ ] 检查圆角值
- [ ] 检查字体大小和行高
- [ ] 测试页面视觉效果
- [ ] 检查响应式布局

## 常见问题

**Q: 我的组件使用了 `scoped` 样式，CSS变量会生效吗？**  
A: 会的。CSS变量在 `:root` 中定义，是全局的，即使在 `scoped` 样式中也可以使用。

**Q: 如何为特定组件覆盖颜色变量？**  
A: 可以在组件的样式中重新定义变量：

```css
.my-component {
  --agent-primary: #custom-color;
  /* 组件内所有使用 var(--agent-primary) 的地方都会使用新值 */
}
```

**Q: 是否可以混用硬编码颜色和CSS变量？**  
A: 技术上可以，但不推荐。为了保持一致性，建议统一使用CSS变量。

**Q: 如何处理第三方组件库的颜色？**  
A: 可以使用 `:deep()` 选择器来覆盖第三方组件的样式：

```css
.my-wrapper :deep(.ant-btn-primary) {
  background: var(--agent-primary);
  border-color: var(--agent-primary);
}
```
