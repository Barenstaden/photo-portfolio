<template>
  <div v-if="album" class="pb-12">
    <div class="relative h-72 w-full overflow-hidden bg-cover bg-center lg:h-[58vh]"
         :style="{backgroundImage: `url(${album?.cover?.image?.url})`}">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>
      <div class="absolute inset-x-0 bottom-0 px-4 py-8 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="text-sm font-medium text-white/75 hover:text-white">Album</NuxtLink>
        <h1 class="mt-2 max-w-5xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
          {{ album?.title }}
        </h1>
      </div>
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
const editMode = useState('editMode')

const album = ref();
const fetchAlbum = async () => {
  try {
    const {data} = await findOne<ApiAlbumAlbum>(`albums`, route.params.slug[0])
    album.value = data;
  } catch (e) {
    // console.log(e)
  }
}

await fetchAlbum();

watch(editMode, async () => {
  if (!editMode.value) {
    await fetchAlbum()
  }
})
</script>
