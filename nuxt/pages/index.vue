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

    <div class="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-semibold tracking-tight text-gray-900">Album</h2>
      <div v-if="user?.role?.type === 'owner'" class="flex flex-wrap items-center gap-2">
        <NuxtLink
          to="/add-image?mode=new"
          class="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
        >
          Legg til album
        </NuxtLink>
        <Button type="button" @click="toggleAlbumOrderMode">
          {{ reorderAlbums ? 'Ferdig' : 'Rediger rekkefølge' }}
        </Button>
      </div>
    </div>

    <div
      v-if="user?.role?.type === 'owner' && reorderAlbums"
      ref="container"
      class="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4"
    >
      <NuxtLink
        v-for="(album, index) in albums"
        :key="album.id"
        :to="`/album/${album.url}`"
        :data-swapy-slot="index"
        class="group block h-full rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div :data-swapy-item="album.documentId" class="h-full">
          <Image
            draggable="false"
            :image="album.cover?.image"
            :alt="album.title"
            size="medium"
            aspect="photo"
            interactive
          />
          <div class="flex items-center justify-between gap-3 px-1 py-3 text-sm">
            <p class="min-w-0 truncate font-medium text-gray-800">{{ album.title }}</p>
            <button
              type="button"
              data-swapy-handle
              class="shrink-0 cursor-grab touch-none select-none rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 active:cursor-grabbing"
              @click.stop
            >
              Flytt
            </button>
          </div>
        </div>
      </NuxtLink>
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
          <p class="min-w-0 truncate text-base font-medium text-gray-800">{{ album.title }}</p>
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
import Button from "~/components/Button.vue";
import {createSwapy} from "swapy";

const {find} = useStrapi();
const user = useState('user');
const {update} = useStrapi()

const albums = ref<ApiAlbumAlbum[]>([]);
const reorderAlbums = ref(false)
let swapyInstance: ReturnType<typeof createSwapy> | null = null
let swapTimeout: ReturnType<typeof setTimeout> | null = null

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

const initSwapy = async () => {
  destroySwapy()
  await nextTick();
  if (container.value && reorderAlbums.value) {
    swapyInstance = createSwapy(container.value)
    swapyInstance.onSwap(async ({data}) => {
      if (swapTimeout) clearTimeout(swapTimeout);
      swapTimeout = setTimeout(async () => {
        for (const item of data.array) {
          await update<ApiAlbumAlbum>('albums', item.itemId, {
            order: item.slotId
          });
        }
      }, 1000);
    })
  }
}

const destroySwapy = () => {
  if (swapTimeout) {
    clearTimeout(swapTimeout)
    swapTimeout = null
  }

  if (swapyInstance) {
    swapyInstance.destroy()
    swapyInstance = null
  }
}

const toggleAlbumOrderMode = () => {
  reorderAlbums.value = !reorderAlbums.value
}

watch(reorderAlbums, async (enabled) => {
  if (enabled) {
    await initSwapy()
    return
  }

  destroySwapy()
  await fetchAlbums()
})

onBeforeUnmount(() => {
  destroySwapy()
})
</script>
