<template>
  <img class="mb-4 w-full rounded-lg"
       :width="image?.formats.small.width"
       :height="image?.formats.small.height"
       :src="image?.formats[size ?? 'small']?.url">
</template>

<script lang="ts" setup>
  import type {Media} from '../../strapi/node_modules/@strapi/types/dist/schema/attribute';

  const { image, size } = defineProps<{
    image: Media,
    size?: string
  }>()
</script>
