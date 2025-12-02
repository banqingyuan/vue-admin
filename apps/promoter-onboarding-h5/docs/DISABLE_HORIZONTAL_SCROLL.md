# 禁用横向滚动功能实现

## 概述

为了提升移动端用户体验，在整个 onboarding app 中禁用了横向滚动功能，防止用户意外触发横向滑动导致页面错位。

## 实现位置

### 1. App.vue（主应用容器）

**文件**: `src/App.vue`

```css
:global(html, body, #app) {
  height: 100%;
  margin: 0;
  background: var(--basic-0, #141414);
  overflow-x: hidden; /* 禁用横向滚动 */
  width: 100%;
  position: relative;
}

:global(html) {
  overflow-x: hidden;
  width: 100%;
}

:global(body) {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

.app-shell {
  max-width: 700px;
  min-height: 100%;
  margin: 0 auto;
  background: var(--basic-0, #141414);
  overflow-x: hidden; /* 确保 app-shell 也不会横向滚动 */
  width: 100%;
}
```

**关键属性说明**：

- `overflow-x: hidden` - 隐藏横向溢出内容
- `width: 100%` - 确保宽度不超过父容器
- `max-width: 100vw` - 最大宽度限制为视口宽度
- `position: relative` - 建立定位上下文

### 2. variables.css（全局样式）

**文件**: `src/styles/variables.css`

```css
/* Global Styles */
html,
body {
  background: var(--basic-0);
  color: var(--basic-10);
  font-family: var(--font-family-primary);
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* 禁用横向滚动 */
  width: 100%;
  max-width: 100vw;
}

* {
  box-sizing: border-box;
}

/* 确保所有元素不会超出视口宽度 */
body {
  position: relative;
  overflow-x: hidden;
}

#app {
  overflow-x: hidden;
  width: 100%;
}
```

## 技术细节

### 多层防护策略

采用了多层防护策略，确保在不同层级都禁用了横向滚动：

1. **HTML 层级**

   ```css
   html {
     overflow-x: hidden;
     width: 100%;
   }
   ```

2. **Body 层级**

   ```css
   body {
     overflow-x: hidden;
     width: 100%;
     max-width: 100vw;
     position: relative;
   }
   ```

3. **App 容器层级**

   ```css
   #app {
     overflow-x: hidden;
     width: 100%;
   }
   ```

4. **应用 Shell 层级**
   ```css
   .app-shell {
     overflow-x: hidden;
     width: 100%;
     max-width: 700px; /* 设计稿最大宽度 */
   }
   ```

### 为什么需要多层设置？

1. **浏览器兼容性**：不同浏览器可能在不同层级上处理滚动
2. **嵌套组件**：防止子组件的宽度溢出导致横向滚动
3. **动态内容**：确保动态加载的内容也不会触发横向滚动
4. **保险策略**：多层设置提供更可靠的保障

## 影响范围

### 受影响的功能

✅ **保留的功能**：

- 纵向滚动（`overflow-y`）仍然正常工作
- 所有页面的上下滚动不受影响
- 模态框、弹窗等组件的滚动不受影响

❌ **禁用的功能**：

- 所有页面的横向滚动
- 手指左右滑动触发的横向移动
- 超宽内容的横向查看

### 潜在问题和解决方案

#### 问题1：超宽内容被截断

**场景**：某些内容（如长文本、宽表格）可能超出屏幕宽度

**解决方案**：

```css
/* 对于需要显示完整内容的元素 */
.overflow-content {
  overflow-x: auto; /* 允许该元素横向滚动 */
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}
```

#### 问题2：手势冲突

**场景**：某些手势操作可能被阻止

**解决方案**：

- 使用 `touch-action` 属性控制触摸行为
- 在需要横向滑动的组件上单独设置

```css
.swipeable-component {
  touch-action: pan-x; /* 允许横向滑动 */
}
```

## 测试验证

### 测试用例

1. **基础滚动测试**
   - ✅ 页面纵向滚动正常
   - ✅ 无法横向滚动
   - ✅ 手指左右滑动无反应

2. **不同页面测试**
   - ✅ 登录页
   - ✅ 首页
   - ✅ 申请页面
   - ✅ 推广分享页
   - ✅ 收益明细页
   - ✅ 提现页面

3. **特殊组件测试**
   - ✅ 模态框滚动正常
   - ✅ 下拉菜单正常
   - ✅ 输入框正常
   - ✅ 二维码展示正常

4. **设备测试**
   - ✅ iPhone（Safari）
   - ✅ Android（Chrome）
   - ✅ 不同屏幕尺寸

### 测试方法

#### 方法1：手动滑动测试

```
1. 在移动设备上打开 app
2. 尝试左右滑动屏幕
3. 预期：页面不会横向移动
```

#### 方法2：开发者工具测试

```
1. 在 Chrome DevTools 中打开移动设备模拟
2. 选择不同的设备尺寸
3. 尝试拖动横向滚动条
4. 预期：不显示横向滚动条
```

#### 方法3：超宽内容测试

```
1. 在页面中插入一个超宽元素
2. 观察页面是否出现横向滚动
3. 预期：超宽内容被隐藏，不出现滚动条
```

## 相关 CSS 属性说明

### overflow-x

```css
overflow-x: hidden; /* 隐藏横向溢出 */
overflow-x: auto; /* 需要时显示横向滚动条 */
overflow-x: scroll; /* 始终显示横向滚动条 */
overflow-x: visible; /* 显示溢出内容（默认）*/
```

### width 和 max-width

```css
width: 100%; /* 宽度为父容器的 100% */
max-width: 100vw; /* 最大宽度为视口宽度 */
max-width: 700px; /* 最大宽度为 700px（设计稿尺寸）*/
```

### box-sizing

```css
* {
  box-sizing: border-box; /* padding 和 border 包含在 width 内 */
}
```

这个设置确保了所有元素的宽度计算包含 padding 和 border，避免因为额外的 padding/border 导致元素超出容器宽度。

## 最佳实践

### 1. 避免使用固定宽度

❌ **不推荐**：

```css
.container {
  width: 500px; /* 固定宽度可能超出小屏幕 */
}
```

✅ **推荐**：

```css
.container {
  width: 100%;
  max-width: 500px; /* 使用最大宽度 */
}
```

### 2. 使用响应式单位

❌ **不推荐**：

```css
.element {
  width: 400px; /* 固定像素值 */
}
```

✅ **推荐**：

```css
.element {
  width: 90%; /* 百分比 */
  width: 90vw; /* 视口宽度 */
  width: calc(100% - 32px); /* 计算值 */
}
```

### 3. 处理长文本

```css
.long-text {
  overflow-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 单词内换行 */
  white-space: normal; /* 正常换行 */
}
```

### 4. 处理宽图片

```css
img {
  max-width: 100%; /* 图片最大宽度为容器宽度 */
  height: auto; /* 保持纵横比 */
}
```

## 性能影响

### 渲染性能

✅ **正面影响**：

- 减少了浏览器需要处理的滚动方向
- 简化了布局计算
- 提升了滚动性能

⚠️ **注意事项**：

- `overflow: hidden` 可能会触发新的层叠上下文
- 在某些浏览器中可能影响固定定位元素

### 内存占用

- 禁用横向滚动对内存占用影响可忽略不计

## 浏览器兼容性

| 属性                     | Chrome    | Safari    | Firefox   | Edge      |
| ------------------------ | --------- | --------- | --------- | --------- |
| `overflow-x: hidden`     | ✅ 全版本 | ✅ 全版本 | ✅ 全版本 | ✅ 全版本 |
| `max-width: 100vw`       | ✅ 26+    | ✅ 6.1+   | ✅ 19+    | ✅ 12+    |
| `box-sizing: border-box` | ✅ 10+    | ✅ 5.1+   | ✅ 29+    | ✅ 12+    |

**结论**：所有现代移动浏览器都完全支持所使用的 CSS 属性。

## 回滚方案

如果需要恢复横向滚动，只需移除以下 CSS 属性：

### App.vue

```css
/* 移除或注释这些行 */
overflow-x: hidden;
width: 100%;
max-width: 100vw;
```

### variables.css

```css
/* 移除或注释这些行 */
overflow-x: hidden;
width: 100%;
max-width: 100vw;
```

## 相关资源

- [MDN - overflow-x](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x)
- [MDN - box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
- [CSS Tricks - Preventing Body Scrolling](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/)

## 总结

### 实现要点

✅ 在多个层级设置 `overflow-x: hidden`  
✅ 限制最大宽度为视口宽度  
✅ 使用 `box-sizing: border-box` 避免宽度溢出  
✅ 保持纵向滚动正常工作

### 用户体验提升

✅ 防止意外横向滑动  
✅ 页面更加稳定  
✅ 符合移动端应用习惯  
✅ 提升整体使用体验

修改完成后，整个 onboarding app 将不再支持横向滚动，提供更好的移动端使用体验。🎉
