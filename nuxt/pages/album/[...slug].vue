<template>
  <div class="w-full h-64 lg:h-[60vh] bg-cover bg-center relative"
       :style="{backgroundImage: `url(${album?.cover?.image?.url})`}">
    <h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-bold absolute inset-0 flex justify-center items-center">
      {{ album?.title }}
    </h1>
  </div>
  <MasonryAlbum :images="album.images" link="image"/>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";

const album = ref();
const route = useRoute();
const page = ref(6);
try {
  const {data} = await useFetch(`/api/albums/${route.params.slug[0]}`)
  console.log(data.value)
  album.value = data?.value?.data;
} catch (e) {
  console.log(e)
}
</script>
