# 推广分享页面 UI 更新

## 更新时间
2025-11-26

## 背景
根据 Figma 设计稿还原 onboarding app 中的推广分享页面（"我的邀请信息"页面）样式。

**设计稿链接**：https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/JPQ-代理平台?node-id=63-3539

## 更新内容

### 文件路径
`/Users/qingyuan/qingyuaner/vue-vben-admin/apps/promoter-onboarding-h5/src/pages/PromotionShare.vue`

### 详细变更

#### 1. 邀请码卡片
**HTML 结构调整**：
```vue
<!-- 之前 -->
<section class="card code-card">
  <div class="card-title">邀请码</div>
  <div class="code-row">
    <p class="invite-code">{{ formattedInviteCode }}</p>
    <button class="ghost-btn icon-button">...</button>
  </div>
</section>

<!-- 更新后 -->
<section class="card code-card">
  <div class="code-header">
    <p class="card-title">邀请码</p>
    <div class="code-display-row">
      <p class="invite-code">{{ formattedInviteCode }}</p>
      <button class="icon-btn">...</button>
    </div>
  </div>
</section>
```

**样式变更**：
- 邀请码字体大小：`30px` → `33px`
- 布局调整：使用 flex 布局，标题和代码在同一行
- 按钮间距：`gap: 11px`
- 卡片内边距：`padding: 10px 12px`

#### 2. 邀请链接卡片
**样式变更**：
- 二维码尺寸：`210px × 210px` → `160px × 160px`
- 移除二维码圆角和阴影效果
- 二维码提示文字大小：`14px` → `16px`
- 卡片内部间距：`gap: 10px`
- 二维码区域上边距：`margin-top: 14px`

#### 3. 邀请文案卡片
**HTML 结构调整**：
```vue
<!-- 之前 -->
<div class="script-text">
  <p>推荐你用【AI 扑克记牌器】：</p>
  <p>下载链接：<span class="highlight-text">{{ downloadLink }}</span></p>
  <p>登录后输入邀请码【{{ formattedInviteCode }}】可多得一天免费 SVIP 会员哈。</p>
</div>

<!-- 更新后 -->
<div class="script-text">
  <p>推荐你用【AI 扑克记牌器】：</p>
  <p>下载链接：<span class="highlight-text">{{ downloadLink }}</span></p>
  <p class="empty-line">&nbsp;</p>
  <p>登录后输入邀请码【<span class="highlight-text">{{ formattedInviteCode }}</span>】可多得一天免费 SVIP 会员哈。</p>
</div>
```

**样式变更**：
- 标题文字：移除 `（示例）` 后缀
- 新增空行分隔
- 邀请码高亮显示
- 卡片内部间距：`gap: 24px`
- 文字行高：`line-height: normal`

#### 4. 使用规则卡片
**样式变更**：
- 卡片内部间距：`gap: 12px`
- 文案内容优化
- 标题颜色统一使用 `var(--primary-6, #ffe395)`

#### 5. 按钮样式统一
**图标按钮**：
```css
.icon-btn {
  background: transparent;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.icon-btn img {
  width: 20px;
  height: 20px;
}
```

**次要按钮（Ghost Button）**：
```css
.ghost-btn {
  background: var(--basic-1, #1f1f1f);
  border: 1px solid var(--basic-3, #434343);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
```

**主要按钮（Primary Button）**：
```css
.primary-btn {
  background: var(--primary-6, #ffe395);
  border: 1px solid var(--primary-6, #ffe395);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: var(--primary-12, #201e1a);
}
```

## 设计规范总结

### 间距规范
- 卡片间距：`16px`
- 卡片内边距：`10px 12px`（上下 10px，左右 12px）
- 卡片内元素间距：
  - 大间距（不同区域）：`24px`
  - 中间距（标题到内容）：`12px`
  - 小间距（元素之间）：`8px`、`10px`、`11px`

### 字体规范
- 标题（卡片标题）：
  - 字体：PingFang SC Semibold
  - 大小：16px
  - 行高：24px
  - 颜色：`var(--primary-6, #ffe395)`

- 邀请码：
  - 字体：DingTalk JinBuTi
  - 大小：33px
  - 行高：normal
  - 颜色：`var(--primary-6, #ffe395)`

- 正文：
  - 字体：PingFang SC Regular
  - 大小：16px
  - 行高：24px（内容文字）/ normal（特殊文字）
  - 颜色：`var(--basic-6, #bfbfbf)` 或 `var(--primary-1, #fffdf0)`

- 按钮文字：
  - 字体：PingFang SC Medium
  - 大小：14px
  - 行高：22px

### 颜色规范
- 主色调（高亮）：`var(--primary-6, #ffe395)`
- 背景色：
  - 页面：`#141414`
  - 卡片：`var(--basic-1, #1f1f1f)`
- 文字：
  - 主要：`var(--basic-10, #ffffff)`
  - 次要：`var(--basic-6, #bfbfbf)`
  - 提示：`var(--basic-5, #8c8c8c)`
  - 高亮：`var(--primary-6, #ffe395)`
- 边框：`var(--basic-3, #434343)`

### 圆角规范
- 卡片：`12px`
- 按钮：`10px`

## 兼容性

✅ 完全向后兼容
- 仅调整样式和布局
- 功能逻辑未改变
- 数据绑定保持不变

## 测试要点

1. **邀请码显示**
   - ✅ 字体大小正确（33px）
   - ✅ 与标题在同一行
   - ✅ 复制按钮位置正确

2. **邀请链接**
   - ✅ 链接文字正确显示
   - ✅ 复制按钮可用
   - ✅ 二维码尺寸正确（160x160）

3. **邀请文案**
   - ✅ 包含空行分隔
   - ✅ 邀请码高亮显示
   - ✅ 复制功能正常

4. **使用规则**
   - ✅ 文案显示完整
   - ✅ 间距正确

5. **响应式**
   - ✅ 各种屏幕尺寸下布局正常
   - ✅ 文字不溢出

## 视觉对比

### 主要改进
1. **更清晰的视觉层次**：通过间距和字体大小优化
2. **更简洁的布局**：邀请码和标题在同一行，节省空间
3. **更合理的二维码尺寸**：160x160 更适合手机屏幕
4. **更统一的按钮样式**：所有按钮遵循同一规范
5. **更好的可读性**：合理的行高和间距

## 相关文档

- [Figma 设计稿](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/JPQ-代理平台?node-id=63-3539)
- [设计系统规范](./DESIGN_SYSTEM.md)（如果有）

## 总结

此次更新完全基于 Figma 设计稿进行了精确还原，主要改进包括：
- 优化了邀请码卡片的布局和字体大小
- 调整了二维码尺寸使其更适合移动端
- 统一了所有按钮的样式规范
- 优化了文案展示，增加了高亮和空行
- 使用 CSS 变量，便于后续主题切换

所有改动都遵循了设计规范，保持了视觉一致性，提升了用户体验。

