<script setup lang="ts">
import { useId } from 'vue'

export interface SalInputProps {
  label?: string
  placeholder?: string
  type?: 'text' | 'search' | 'number'
  disabled?: boolean
  error?: string
  maxlength?: number
}

withDefaults(defineProps<SalInputProps>(), {
  label: undefined,
  placeholder: undefined,
  type: 'text',
  disabled: false,
  error: undefined,
  maxlength: undefined
})

const model = defineModel<string>({ default: '' })

const inputId = useId()
const errorId = useId()
</script>

<template>
  <div
    :class="[
      'sal-input',
      {
        'is-disabled': disabled,
        'is-error': Boolean(error)
      }
    ]">
    <label
      v-if="label"
      :for="inputId"
      class="sal-input__label">
      {{ label }}
    </label>

    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      class="sal-input__control">

    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="sal-input__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.sal-input {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
}

.sal-input__label {
  font-size: var(--sal-font-size-sm);
  font-weight: var(--sal-font-weight-medium);
  color: var(--sal-text-secondary);
}

.sal-input__control {
  min-height: var(--sal-control-md);
  width: 100%;
  padding: 0 var(--sal-space-3);
  border: 1px solid var(--sal-border-strong);
  border-radius: var(--sal-radius-md);
  background-color: var(--sal-surface-base);
  color: var(--sal-text-primary);
  font-family: inherit;
  font-size: var(--sal-font-size-md);
  transition: border-color var(--sal-transition-fast);
}

.sal-input__control::placeholder {
  color: var(--sal-text-muted);
}

.sal-input__control:focus {
  outline: none;
  border-color: var(--sal-border-focus);
}

.sal-input.is-error .sal-input__control {
  border-color: var(--sal-danger);
}

.sal-input.is-disabled .sal-input__control {
  opacity: 0.5;
  cursor: not-allowed;
}

.sal-input__error {
  margin: 0;
  font-size: var(--sal-font-size-xs);
  color: var(--sal-danger-text);
}
</style>
