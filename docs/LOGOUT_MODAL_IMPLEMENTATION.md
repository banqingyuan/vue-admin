# 退出登录弹窗实现

## 更新时间

2025-11-26

## 背景

根据 Figma 设计稿实现从底部弹出的退出登录对话框，用户可以通过点击设置按钮或头像触发该弹窗。

**设计稿链接**：https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/JPQ-代理平台?node-id=295-10743

## 实现内容

### 1. 新增组件

#### LogoutModal.vue

**文件路径**：`/apps/promoter-onboarding-h5/src/components/LogoutModal.vue`

**功能特性**：

- ✅ 从底部弹出的模态对话框
- ✅ 半透明黑色遮罩层（70% 透明度）
- ✅ 显示脱敏后的当前登录手机号（如：135\*\*\*0000）
- ✅ "退出登录" 主要按钮（黄色背景）
- ✅ "取消" 次要按钮（深色背景）
- ✅ 平滑的进入/退出动画
- ✅ 点击遮罩层可关闭
- ✅ 使用 Teleport 渲染到 body 层级

**Props**：

```typescript
{
  visible: boolean; // 控制弹窗显示/隐藏
}
```

**Events**：

```typescript
{
  'update:visible': (value: boolean) => void  // 更新显示状态
  'logout': () => void                        // 触发退出登录
}
```

**关键实现**：

1. **脱敏手机号**：

```vue
const maskedPhone = computed(() => { const phone = auth.user?.phone || ''; if
(phone.length === 11) { return `${phone.slice(0, 3)}***${phone.slice(7)}`; }
return '***'; });
```

2. **从底部弹出动画**：

```css
.modal-enter-from .logout-modal-content {
  transform: translateY(100%);
}

.modal-leave-to .logout-modal-content {
  transform: translateY(100%);
}
```

### 2. 更新的组件

#### AccountStatus.vue

**文件路径**：`/apps/promoter-onboarding-h5/src/components/agent/AccountStatus.vue`

**主要变更**：

- ❌ 移除右上角下拉菜单（旧实现）
- ✅ 集成 LogoutModal 组件
- ✅ 点击设置按钮显示底部弹窗
- 🧹 清理不需要的状态和事件监听

**之前的实现**：

- 使用 dropdown 菜单在设置按钮下方显示
- 需要处理点击外部关闭的逻辑
- 菜单样式简单

**现在的实现**：

```vue
<!-- 设置按钮 -->
<button class="settings-btn" @click="showLogoutModal">
  <img src="/setting.svg" alt="设置" />
</button>

<!-- 退出登录弹窗 -->
<LogoutModal v-model:visible="isLogoutModalVisible" @logout="handleLogout" />
```

#### AppHeader.vue

**文件路径**：`/apps/promoter-onboarding-h5/src/components/ui/AppHeader.vue`

**主要变更**：

- ✅ 集成 LogoutModal 组件
- ✅ 点击头像显示底部弹窗
- ✅ 实现退出登录逻辑

**之前的实现**：

```typescript
function handleShowProfile() {
  // TODO: 实现显示用户信息逻辑
  console.log('显示用户信息');
}
```

**现在的实现**：

```typescript
function handleShowProfile() {
  isLogoutModalVisible.value = true;
}

function handleLogout() {
  auth.logout();
  agent.clearData();
  router.replace('/login');
}
```

## 设计规范

### 布局规范

- **遮罩层**：全屏覆盖，背景色 `rgba(0, 0, 0, 0.7)`
- **内容区域**：底部对齐，内边距 16px
- **按钮间距**：16px
- **最大宽度**：343px（居中显示）

### 字体规范

- **提示文字**：
  - 字体：PingFang SC Semibold
  - 大小：16px
  - 行高：24px
  - 颜色：#ffffff

- **按钮文字**：
  - 字体：PingFang SC Semibold
  - 大小：16px
  - 行高：24px

### 颜色规范

- **主要按钮（退出登录）**：
  - 背景：`var(--primary-6, #ffe395)`
  - 文字：`var(--primary-12, #201e1a)`

- **次要按钮（取消）**：
  - 背景：`var(--basic-2, #262626)`
  - 文字：`var(--basic-10, #ffffff)`

### 尺寸规范

- **按钮高度**：50px
- **按钮圆角**：10px
- **按钮宽度**：100%（最大 343px）

### 动画规范

- **持续时间**：0.3s
- **缓动函数**：ease
- **进入效果**：
  - 遮罩层：淡入
  - 内容区：从底部向上滑入
- **退出效果**：
  - 遮罩层：淡出
  - 内容区：向下滑出

## 触发方式

### 方式一：设置按钮

- **位置**：代理首页（AgentHome）顶部 AccountStatus 组件右侧
- **图标**：设置图标（/setting.svg）
- **触发**：点击设置按钮

### 方式二：头像按钮

- **位置**：AppHeader 组件右上角
- **图标**：用户头像（/profile-placeholder.png）
- **触发**：点击头像

## 退出登录流程

```
用户点击设置/头像
    ↓
显示底部弹窗（带动画）
    ↓
显示脱敏手机号
    ↓
用户点击"退出登录"
    ↓
1. 清除 auth store 数据
2. 清除 agent store 数据
3. 跳转到登录页面
```

## 交互细节

### 1. 打开弹窗

- ✅ 从底部平滑滑入（0.3s）
- ✅ 遮罩层同时淡入
- ✅ 显示当前登录账号

### 2. 关闭弹窗

可以通过以下方式关闭：

- ✅ 点击"取消"按钮
- ✅ 点击遮罩层
- ✅ 点击"退出登录"后自动关闭

### 3. 退出登录

- ✅ 点击"退出登录"按钮
- ✅ 弹窗关闭
- ✅ 清除所有用户数据
- ✅ 跳转到登录页面

### 4. 阻止冒泡

- ✅ 弹窗内容区点击不会关闭弹窗
- ✅ 只有点击遮罩层才会关闭

## 技术实现细节

### 1. Teleport 使用

使用 Vue 3 的 Teleport 将弹窗渲染到 body 层级，避免 z-index 层级问题：

```vue
<Teleport to="body">
  <Transition name="modal">
    <div v-if="visible" class="logout-modal-overlay">
      <!-- 内容 -->
    </div>
  </Transition>
</Teleport>
```

### 2. v-model 双向绑定

使用 `v-model:visible` 实现父子组件双向绑定：

```vue
<!-- 父组件 -->
<LogoutModal v-model:visible="isLogoutModalVisible" @logout="handleLogout" />

<!-- 子组件 -->
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void; (e:
'logout'): void; }>();
```

### 3. 防止事件冒泡

```vue
<!-- 点击遮罩关闭 -->
<div class="logout-modal-overlay" @click="handleCancel">
  <!-- 点击内容不关闭 -->
  <div class="logout-modal-content" @click.stop>
    <!-- 内容 -->
  </div>
</div>
```

### 4. 组合式 API

使用 Vue 3 组合式 API，代码更简洁：

```typescript
const isLogoutModalVisible = ref(false);

function showLogoutModal() {
  isLogoutModalVisible.value = true;
}

function handleLogout() {
  auth.logout();
  agent.clearData();
  router.replace('/login');
}
```

## 兼容性

✅ **完全向后兼容**

- 不影响现有功能
- 仅改进用户体验
- 统一退出登录入口

## 测试要点

### 1. 功能测试

- [ ] 点击设置按钮弹出对话框
- [ ] 点击头像弹出对话框
- [ ] 显示正确的脱敏手机号
- [ ] 点击"退出登录"成功退出
- [ ] 点击"取消"关闭弹窗
- [ ] 点击遮罩层关闭弹窗
- [ ] 点击内容区不关闭弹窗

### 2. 动画测试

- [ ] 弹窗从底部平滑滑入
- [ ] 遮罩层淡入效果流畅
- [ ] 关闭时向下滑出
- [ ] 动画时长符合预期（0.3s）

### 3. 样式测试

- [ ] 按钮颜色正确
- [ ] 文字大小和间距正确
- [ ] 在不同屏幕尺寸下居中显示
- [ ] 最大宽度限制有效（343px）

### 4. 边界测试

- [ ] 未登录状态处理
- [ ] 手机号为空的处理
- [ ] 连续快速点击不会出现问题
- [ ] 多次打开/关闭流畅

## 视觉对比

### 之前：

- 小型下拉菜单
- 在设置按钮下方显示
- 样式简单

### 现在：

- 底部弹出大型对话框
- 更明显的视觉提示
- 更符合移动端交互习惯
- 与 Figma 设计稿完全一致

## 相关文件

### 新增

- `/apps/promoter-onboarding-h5/src/components/LogoutModal.vue`

### 修改

- `/apps/promoter-onboarding-h5/src/components/agent/AccountStatus.vue`
- `/apps/promoter-onboarding-h5/src/components/ui/AppHeader.vue`

## 总结

此次实现完全基于 Figma 设计稿，将退出登录功能从简单的下拉菜单升级为底部弹出的模态对话框，主要改进包括：

1. **更好的用户体验**：底部弹出符合移动端操作习惯
2. **统一的交互入口**：设置按钮和头像都能触发
3. **清晰的视觉提示**：大型对话框更容易引起注意
4. **安全确认**：显示当前登录账号，避免误操作
5. **平滑的动画效果**：提升产品质感

所有实现都遵循了设计规范，保持了视觉一致性，提升了整体用户体验。
