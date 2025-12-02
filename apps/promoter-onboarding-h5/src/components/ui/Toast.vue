<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="visible" class="toast-container">
        <div class="toast" :class="typeClass">
          <div class="toast-icon" v-if="type === 'success'">
            <img src="/check-circle.svg" alt="success" />
          </div>
          <div class="toast-icon" v-else-if="type === 'error'">
            <img src="/close-circle.svg" alt="error" />
          </div>
          <div class="toast-icon" v-else>
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6.75" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 4.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
            </svg>
          </div>
          <p class="toast-text">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3500,
  visible: false,
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(props.visible);
let timer: ReturnType<typeof setTimeout> | null = null;

const typeClass = {
  error: 'toast-error',
  success: 'toast-success',
  info: 'toast-info',
}[props.type];

const startTimer = () => {
  if (props.duration > 0) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      visible.value = false;
      emit('close');
    }, props.duration);
  }
};

// 组件挂载时如果visible为true，启动定时器
onMounted(() => {
  if (props.visible) {
    startTimer();
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

watch(() => props.visible, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    startTimer();
  }
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 66px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
}

.toast {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.06);
  pointer-events: auto;
  min-width: 60px;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d2517;
}

.toast-error .toast-icon {
  color: var(--danger-6);
}

.toast-success .toast-icon {
  color: var(--success-6);
}

.toast-text {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 22px;
  color: #2D2517;
  margin: 0;
  white-space: nowrap;
}

/* Transition */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

