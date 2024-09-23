<template>
  <div class="gap-4 mt-4 px-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
    <a class="relative mb-4" :href="`/${link}/${image.url}`" v-for="(image, index) in images" :key="image.id">
      <img class="mb-4 w-full rounded-lg"
           :class="{
              'blur-sm': !loadedImages[index]
           }"
           v-observe-visibility="(isVisible) => visibilityChanged(isVisible, index)"
           :width="image.image.formats.small.width"
           :height="image.image.formats.small.height"
           :src="loadedImages[index] ? image.image.formats.small.url : image.image.formats.thumbnail.url" >
      <div
        class="absolute rounded-lg inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black bg-opacity-0 hover:bg-opacity-50 transform duration-150 opacity-0 hover:opacity-75">
      </div>
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

const {link, images, useTitle} = defineProps<{
  link: string,
  images: {
    id: number
    title: string
    image: {
      formats: IImageFormat
    }
  }[]
}>()

const visibilityChanged = (isVisible: boolean, index: number) => {
  if (isVisible) {
    loadedImages.value[index] = true;
  }
};
</script>
