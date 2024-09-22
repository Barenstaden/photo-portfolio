<template>
  <div class="grid gap-4 mb-10">
    <div class="h-10 flex justify-between align-middle items-center">
      <div class="">
        <nuxt-link class="text-lg" to="/">Øyvind Bjørnstad Foto</nuxt-link>
      </div>
    </div>
    <div class="w-full h-[60vh] bg-cover bg-center relative"
         style="background-image: url('images/bakgrunnsbilde.jpg');">
      <h1 class="text-white text-5xl font-bold absolute inset-0 flex justify-center items-center">
        Øyvind Bjørnstad foto
      </h1>
    </div>

    <div class="px-4 mx-auto">
      <h2 class="text-3xl">Album</h2>
    </div>

    <div class="gap-4 px-4 columns-1 md:columns-2">
      <a :href="`/album/${album.url}`" v-for="album in albums" :key="album.id" class="relative mb-4">
        <img class="mb-4 w-full rounded-lg"
             :src="album.cover?.image?.formats.small.url">
        <h2
          class="absolute rounded-lg inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black bg-opacity-0 hover:bg-opacity-75 transform duration-150 opacity-0 hover:opacity-75">
          {{ album.title }}
        </h2>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const albums = ref();
const {data} = await useFetch(`/api/albums`)

albums.value = data?.value?.data;
import {populate} from "assets/js/populate-from-server";

// onMounted(async () => {
//   await populate()
// })

</script>
