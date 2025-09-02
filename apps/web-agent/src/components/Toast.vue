<script setup lang="ts">
import type { ToastProps } from './toast-types';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { ToastType } from './toast-types';

const props = withDefaults(defineProps<ToastProps>(), {
  type: ToastType.SUCCESS,
  duration: 3000,
});

const emit = defineEmits<{
  close: [];
}>();

const show = ref(false);
let timer: null | number = null;

const toastClass = computed(() => {
  const classes = ['toast'];
  classes.push(`toast-${props.type}`);
  if (show.value) {
    classes.push('toast-show');
  }
  return classes.join(' ');
});

const startTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
  if (props.duration > 0) {
    timer = window.setTimeout(() => {
      handleClose();
    }, props.duration);
  }
};

const handleClose = () => {
  show.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      show.value = true;
      startTimer();
    } else {
      show.value = false;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.visible) {
    show.value = true;
    startTimer();
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <transition name="fade">
    <div v-if="visible" :class="toastClass">
      <span class="toast-message">{{ message }}</span>
    </div>
  </transition>
</template>

<style scoped>
@import '../styles/toast.css';
</style>
