<template>
  <div class="gap-4 mt-4 px-4 columns-1 md:columns-2 lg:columns-3">
    <a class="relative mb-4" :href="`/${link}/${image.url}`" v-for="(image, index) in images" :key="image.id">
      <img class="mb-4 w-full rounded-lg"
           :class="{
              'blur-sm': !loadedImages[index]
           }"
           v-observe-visibility="(isVisible) => visibilityChanged(isVisible, index)"
           :width="image.image.formats.small.width"
           :height="image.image.formats.small.height"
           :src="loadedImages[index] ? image.image.formats.small.url : image.image.formats.thumbnail.url" >
      <h2
        class="absolute rounded-lg inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black bg-opacity-0 hover:bg-opacity-75 transform duration-150 opacity-0 hover:opacity-75">
        {{ image.title }}
      </h2>
    </a>
  </div>
  <div v-observe-visibility="visibilityChanged"></div>
</template>

<script setup lang="ts">
const loadedImages = ref([]);

interface IImageFormat {
  [key: string]: {
    url: string,
    width: number,
    height: number
  }
}

const {link, images} = defineProps<{
  link: string,
  images: {
    id: number
    title: string
    image: {
      formats: IImageFormat
    }
  }[]
}>()

const visibilityChanged = (isVisible, index) => {
  if (isVisible) {
    loadedImages.value[index] = true;
  }
};
</script>
