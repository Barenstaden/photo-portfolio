<template>
  <div v-if="album">
    <div class="w-full h-64 lg:h-[60vh] bg-cover bg-center relative"
         :style="{backgroundImage: `url(${album?.cover?.image?.url})`}">
      <h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-bold absolute inset-0 flex justify-center items-center">
        {{ album?.title }}
      </h1>
    </div>
    <MasonryAlbum :albumId="album?.documentId" :images="album.images" link="image"/>
  </div>

  <div v-if="!album" class="grid h-lvh place-content-center gap-4">
    <h1 class="m-auto text-2xl">Dette albumet finnes ikke</h1>
    <Button><nuxt-link to="/">Gå til forsiden</nuxt-link></Button>
  </div>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import { ApiAlbumAlbum} from "../../../strapi/types/generated/contentTypes";
import Button from "~/components/Button.vue";

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
