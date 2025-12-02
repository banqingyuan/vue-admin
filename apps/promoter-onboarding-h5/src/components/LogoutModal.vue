<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="logout-modal-overlay" @click="handleCancel">
        <div class="logout-modal-content" @click.stop>
          <p class="modal-text">当前登录账号：{{ maskedPhone }}</p>
          <button class="btn btn-logout" @click="handleLogout">退出登录</button>
          <button class="btn btn-cancel" @click="handleCancel">取消</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '#/store/auth';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'logout'): void;
}>();

const auth = useAuthStore();

// 脱敏手机号
const maskedPhone = computed(() => {
  const phone = auth.user?.phone || '';
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}***${phone.slice(7)}`;
  }
  return '***';
});

function handleCancel() {
  emit('update:visible', false);
}

function handleLogout() {
  emit('logout');
  emit('update:visible', false);
}
</script>

<style scoped>
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 1000;
}

.logout-modal-content {
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
}

.modal-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #ffffff;
  text-align: center;
  margin: 0;
  width: 100%;
  max-width: 343px;
}

.btn {
  width: 100%;
  max-width: 343px;
  height: 50px;
  border-radius: 10px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.btn:active {
  opacity: 0.8;
}

.btn-logout {
  background: var(--primary-6, #ffe395);
  color: var(--primary-12, #201e1a);
}

.btn-cancel {
  background: var(--basic-2, #262626);
  color: var(--basic-10, #ffffff);
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .logout-modal-content,
.modal-leave-active .logout-modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .logout-modal-content {
  transform: translateY(100%);
}

.modal-leave-to .logout-modal-content {
  transform: translateY(100%);
}
</style>

