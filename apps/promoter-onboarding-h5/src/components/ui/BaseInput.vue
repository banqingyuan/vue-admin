<template>
  <div class="base-input-wrapper">
    <div v-if="label" class="input-label">
      <span v-if="required" class="required-mark">*</span>
      <span class="label-text">{{ label }}</span>
    </div>
    <div
      :class="[
        'input-container',
        { 'input-focused': isFocused },
        { 'input-error': error }
      ]"
    >
      <div v-if="prefix" class="input-prefix">
        <slot name="prefix">
          <component :is="prefix" />
        </slot>
      </div>
      <input
        v-if="type !== 'textarea'"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        class="input-element"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <textarea
        v-else
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :rows="rows"
        class="textarea-element"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div v-if="suffix" class="input-suffix">
        <slot name="suffix">
          <component :is="suffix" />
        </slot>
      </div>
    </div>
    <div v-if="type === 'textarea' && maxlength" class="textarea-counter">
      {{ modelValue?.length || 0 }} / {{ maxlength }}
    </div>
    <div v-if="error" class="input-error-text">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  modelValue?: string;
  label?: string;
  required?: boolean;
  type?: 'text' | 'password' | 'number' | 'tel' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  maxlength?: number;
  rows?: number;
  prefix?: any;
  suffix?: any;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  required: false,
  type: 'text',
  placeholder: '',
  disabled: false,
  rows: 3,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isFocused = ref(false);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 24px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding-bottom: var(--spacing-8);
  overflow: hidden;
}

.required-mark {
  font-family: 'SimSong', serif;
  font-size: var(--font-size-14);
  line-height: 22.001px;
  color: var(--danger-5);
  text-align: right;
}

.label-text {
  flex: 1;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-24);
  color: var(--basic-10);
  white-space: pre-wrap;
}

.input-container {
  background: var(--basic-0);
  border: 1px solid var(--basic-4);
  border-radius: var(--radius-12);
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  width: 100%;
  transition: border-color 0.2s;
}

.input-container.input-focused {
  border-color: var(--primary-6);
}

.input-container.input-error {
  border-color: var(--danger-5);
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-12);
  color: var(--basic-6);
}

.input-prefix {
  width: 14px;
  height: 14px;
  margin-left: var(--spacing-12);
}

.input-element,
.textarea-element {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-24);
  color: var(--basic-10);
  min-width: 0;
  min-height: inherit;
}

.input-element::placeholder,
.textarea-element::placeholder {
  color: var(--basic-5);
}

.input-element:disabled,
.textarea-element:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.textarea-element {
  resize: none;
  padding: 12px;
  min-height: 88px;
}

.textarea-counter {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-22);
  color: var(--basic-4);
  text-align: right;
  margin-top: var(--spacing-4);
}

.input-error-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-12);
  color: var(--danger-5);
  margin-top: var(--spacing-4);
}
</style>

