<template>
  <div class="grid gap-4 mb-10">
    <div class="w-full h-64 lg:h-[60vh] bg-cover bg-center relative px-10"
         style="background-image: url('images/bakgrunnsbilde.jpg');">
      <h1
        class="text-white text-3xl md:text-4xl lg:text-5xl font-bold absolute inset-0 flex justify-center items-center">
        Øyvind Bjørnstad foto
      </h1>
    </div>

    <!--    <div class="px-4 mx-auto">-->
    <!--      <h2 class="text-3xl">Nyste bilder</h2>-->
    <!--    </div>-->
    <!--    <MasonryAlbum class-list="columns-1 md:columns-2 lg:columns-2 xl:co" link="image" :images="images"/>-->

    <div class="px-4 mx-auto">
      <h2 class="text-3xl">Album</h2>
    </div>

    <MasonryGrid v-if="user?.role.type === 'owner' && editMode">
      <div ref="container">
        <div :data-swapy-slot="index" v-for="(album, index) in albums" :key="album.id">
          <div :data-swapy-item="album.documentId">
            <div data-swapy-handle>
              <Image draggable="false" class="mb-4 w-full rounded-lg"
                     :image="album.cover.image"
                   size="medium"/>
            </div>
          </div>
        </div>
      </div>
    </MasonryGrid>

    <MasonryGrid v-else>
      <NuxtLink :to="`/album/${album.url}`" v-for="album in albums" :key="album.id" class="relative mb-4">
        <Image size="small" :image="album.cover?.image"/>
        <ImageTextOverlay>
          <h2>{{ album.title }}</h2>
        </ImageTextOverlay>
      </NuxtLink>
    </MasonryGrid>
  </div>
</template>

<script setup lang="ts">
import type {ApiAlbumAlbum} from '../../strapi/types/generated/contentTypes'
import MasonryGrid from "~/components/MasonryGrid.vue";
import Image from "~/components/Image.vue";
import ImageTextOverlay from "~/components/ImageTextOverlay.vue";
import {createSwapy} from "swapy";

const {find} = useStrapi();
const config = useRuntimeConfig();
const user = useState('user');
const editMode = useState('editMode')
const {update} = useStrapi()

const albums = ref<ApiAlbumAlbum>();
const images = ref();
const {data} = await find<ApiAlbumAlbum>(`albums`, {
  sort: 'order'
})
albums.value = data;

const container = ref<HTMLDivElement | null>(null)
watch(editMode, () => {
  if(editMode.value) initSwapy();
})
const initSwapy = async () => {
  await nextTick();
  if (container.value && editMode.value) {
    let timeout: Timeout;
    const swapy = createSwapy(container.value)
    swapy.onSwap(async ({data}) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        for (const item of data.array) {
          await update<ApiAlbumAlbum>('albums', item.itemId, {
            order: item.slotId
          });
        }
      }, 1000);
    })
  }
}
</script>
