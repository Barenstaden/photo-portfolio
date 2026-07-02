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

    <div class="px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-semibold tracking-tight text-gray-900">Album</h2>
    </div>

    <div
      v-if="user?.role.type === 'owner' && editMode"
      ref="container"
      class="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4"
    >
      <div :data-swapy-slot="index" v-for="(album, index) in albums" :key="album.id">
        <div :data-swapy-item="album.documentId" class="h-full rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
          <div data-swapy-handle>
            <Image
              draggable="false"
              :image="album.cover?.image"
              :alt="album.title"
              size="medium"
              aspect="photo"
              interactive
              class="cursor-grab active:cursor-grabbing"
            />
            <div class="flex items-center justify-between gap-3 px-1 py-3 text-sm">
              <p class="min-w-0 truncate font-medium text-gray-800">{{ album.title }}</p>
              <span class="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Flytt</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MasonryGrid v-else>
      <NuxtLink
        :to="`/album/${album.url}`"
        v-for="album in albums"
        :key="album.id"
        class="group block h-full rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <Image size="medium" :image="album.cover?.image" :alt="album.title" aspect="photo" interactive/>
        <div class="flex items-center justify-between gap-3 px-1 py-3">
          <h2 class="min-w-0 truncate text-base font-semibold text-gray-900">{{ album.title }}</h2>
          <span class="shrink-0 text-gray-400 transition group-hover:text-gray-900">&rarr;</span>
        </div>
      </NuxtLink>
    </MasonryGrid>
  </div>
</template>

<script setup lang="ts">
import type {ApiAlbumAlbum} from '../../strapi/types/generated/contentTypes'
import MasonryGrid from "~/components/MasonryGrid.vue";
import Image from "~/components/Image.vue";
import {createSwapy} from "swapy";

const {find} = useStrapi();
const user = useState('user');
const editMode = useState('editMode')
const {update} = useStrapi()

const albums = ref<ApiAlbumAlbum[]>([]);
const fetchAlbums = async () => {
  try {
    const {data} = await find<ApiAlbumAlbum>(`albums`, {
      sort: 'order'
    })
    albums.value = data;
  } catch (e) {
    console.log(e)
  }
}
fetchAlbums();

const container = ref<HTMLDivElement | null>(null)
watch(editMode, async () => {
  if(editMode.value) {
    initSwapy();
  } else {
    await fetchAlbums()
  }
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
