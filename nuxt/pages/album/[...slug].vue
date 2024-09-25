<template>
  <div class="w-full h-64 lg:h-[60vh] bg-cover bg-center relative"
       :style="{backgroundImage: `url(${album?.cover?.image?.url})`}">
    <h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-bold absolute inset-0 flex justify-center items-center">
      {{ album?.title }}
    </h1>
  </div>
  <MasonryAlbum :albumId="album?.documentId" :images="album.images" link="image"/>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import { ApiAlbumAlbum} from "../../../strapi/types/generated/contentTypes";

const { findOne } = useStrapi();
const route = useRoute();

const album = ref();
const page = ref(6);
try {
  const {data} = await findOne<ApiAlbumAlbum>(`albums`, route.params.slug[0])
  album.value = data;
} catch (e) {
  // console.log(e)
}
</script>
