<template>
  <div class="relative overflow-hidden bg-gray-100 shadow-sm ring-1 ring-black/5" :class="[aspectClass, rounded]">
    <img
      v-if="imageUrl"
      class="h-full w-full"
      :class="[fitClass, interactive ? 'transition duration-500 group-hover:scale-[1.03]' : '']"
      :width="selectedFormat?.width"
      :height="selectedFormat?.height"
      :src="imageUrl"
      :alt="alt"
      loading="lazy"
    >
    <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-400">
      Bilde mangler
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Media} from '../../strapi/node_modules/@strapi/types/dist/schema/attribute';

const props = withDefaults(defineProps<{
  image?: Media,
  size?: string,
  alt?: string,
  fit?: 'cover' | 'contain',
  aspect?: 'square' | 'photo' | 'portrait' | 'wide',
  rounded?: string,
  interactive?: boolean
}>(), {
  size: 'small',
  alt: '',
  fit: 'cover',
  aspect: 'photo',
  rounded: 'rounded-xl',
  interactive: false
})

const selectedFormat = computed(() => {
  const source = props.image as any;
  const formats = source?.formats ?? {};

  return formats[props.size]
    ?? formats.small
    ?? formats.medium
    ?? formats.thumbnail
    ?? source;
})

const imageUrl = computed(() => selectedFormat.value?.url ?? (props.image as any)?.url)

const fitClass = computed(() => props.fit === 'contain' ? 'object-contain' : 'object-cover')

const aspectClass = computed(() => {
  if (props.aspect === 'square') return 'aspect-square';
  if (props.aspect === 'portrait') return 'aspect-[4/5]';
  if (props.aspect === 'wide') return 'aspect-[16/9]';

  return 'aspect-[4/3]';
})
</script>
