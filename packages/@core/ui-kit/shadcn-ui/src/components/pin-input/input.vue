<script setup lang="ts">
import type { PinInputProps } from './types';

import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';

import { VbenButton } from '../button';

defineOptions({
  inheritAttrs: false,
});

const {
  codeLength = 4,
  createText = async () => {},
  disabled = false,
  handleSendCode = async () => {},
  loading = false,
  maxTime = 60,
  shouldAutoFocus = false,
} = defineProps<PinInputProps>();

const emit = defineEmits<{
  complete: [];
  sendError: [error: any];
}>();

// import VOtpInput from 'vue3-otp-input';
// eslint-disable-next-line n/no-extraneous-import -- 由宿主应用提供依赖（peer/根依赖），此处按需动态加载
const VOtpInput = defineAsyncComponent(() => import('vue3-otp-input')) as any;

const timer = ref<ReturnType<typeof setTimeout>>();

const modelValue = defineModel<string>();

const inputString = ref<string>('');
const countdown = ref(0);

const btnText = computed(() => {
  const countdownValue = countdown.value;
  return createText?.(countdownValue);
});

const btnLoading = computed(() => {
  return loading || countdown.value > 0;
});

watch(
  () => modelValue.value,
  () => {
    inputString.value = modelValue.value ?? '';
  },
);

watch(inputString, (val) => {
  modelValue.value = val ?? '';
});

function handleComplete(value: string) {
  modelValue.value = value ?? '';
  emit('complete');
}

async function handleSend(e: Event) {
  try {
    e?.preventDefault();
    countdown.value = maxTime;
    startCountdown();
    await handleSendCode();
  } catch (error) {
    console.error('Failed to send code:', error);
    // Consider emitting an error event or showing a notification
    emit('sendError', error);
  }
}

function startCountdown() {
  if (countdown.value > 0) {
    timer.value = setTimeout(() => {
      countdown.value--;
      startCountdown();
    }, 1000);
  }
}

onBeforeUnmount(() => {
  countdown.value = 0;
  clearTimeout(timer.value);
});

// const _id = useId(); // Unused, keeping for future use

const otpRef = ref<InstanceType<typeof VOtpInput> | null>(null);

// 处理移动端自动填充
function handleAutoFill(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = target.value?.trim();
  if (value && value.length > 0) {
    otpRef.value?.fillInput?.(value);
    target.value = '';
  }
}

// 动态计算每个输入框的样式类
const getInputClass = (index: number) => {
  const baseClasses =
    'otp-input border-input bg-background relative flex h-10 w-8 items-center justify-center border-y text-center text-sm transition-all focus:relative focus:z-10 focus:outline-none focus:ring-2 md:w-10';

  if (index === 0) {
    // 第一个输入框：左边框 + 左圆角
    return `${baseClasses} border-l rounded-l-md border-r-0`;
  } else if (index === codeLength - 1) {
    // 最后一个输入框：右边框 + 右圆角
    return `${baseClasses} border-r rounded-r-md border-l`;
  } else {
    // 中间输入框：只有左边框
    return `${baseClasses} border-l border-r-0`;
  }
};

// 为每个输入框生成对应的样式类数组
const conditionalClasses = computed(() =>
  Array.from({ length: codeLength }, (_, i) => getInputClass(i)),
);

// 占位符：聚焦时不显示，未聚焦时显示圆点
const placeholders = computed(() =>
  Array.from({ length: codeLength }, () => ''),
);
</script>

<template>
  <div class="relative flex w-full justify-between">
    <!-- 隐藏的输入框用于接收自动填充 -->
    <input
      type="text"
      autocomplete="one-time-code"
      :maxlength="codeLength"
      class="pointer-events-none absolute -left-[9999px] opacity-0"
      @input="handleAutoFill"
    />
    <div class="mr-2">
      <VOtpInput
        ref="otpRef"
        :num-inputs="codeLength"
        v-model:value="inputString"
        :is-disabled="disabled"
        :conditional-class="conditionalClasses"
        input-type="tel"
        inputmode="numeric"
        :placeholder="placeholders"
        :should-auto-focus="shouldAutoFocus"
        :should-focus-order="true"
        @on-complete="handleComplete"
      />
    </div>
    <VbenButton
      :disabled="disabled"
      :loading="btnLoading"
      class="flex-grow"
      size="lg"
      variant="outline"
      @click="handleSend"
    >
      {{ btnText }}
    </VbenButton>
  </div>
</template>

<style>
/* 为 OTP 输入框添加自定义样式 */
.otp-input {
  position: relative;
}

.otp-input:empty::before {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #9ca3af;
  pointer-events: none;
  content: '○';
  transform: translate(-50%, -50%);
}

.otp-input:focus::before {
  display: none;
}

.otp-input:not(:empty)::before {
  display: none;
}
</style>
