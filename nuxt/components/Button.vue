<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200"
  >
    <slot/>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
}>(), {
  type: 'button'
})
</script>
