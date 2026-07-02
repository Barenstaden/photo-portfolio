<template>
  <div class="mt-6 px-4 sm:px-6 lg:px-8">
    <div
      v-if="user?.role.type === 'owner' && editMode"
      ref="container"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :data-swapy-slot="index"
        class="min-w-0"
      >
        <div
          :data-swapy-item="image.documentId"
          class="group h-full rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5"
        >
          <Image
            data-swapy-handle
            draggable="false"
            :image="image.image"
            :alt="image.title"
            size="small"
            aspect="photo"
            interactive
            class="cursor-grab active:cursor-grabbing"
          />
          <div class="flex justify-end px-1 py-3 text-sm">
            <span class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Flytt</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <NuxtLink
        v-for="(image, index) in images"
        :key="image.id"
        class="group block h-full rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        :to="`/${link}/${image.url}`"
        v-observe-visibility="(isVisible) => visibilityChanged(isVisible, index)"
      >
        <Image
          draggable="false"
          :image="image.image"
          :alt="image.title"
          :size="loadedImages[index] ? 'small' : 'thumbnail'"
          aspect="photo"
          interactive
        />
        <div class="flex justify-end px-1 py-3 text-sm">
          <span class="text-gray-400 transition group-hover:text-gray-900">&rarr;</span>
        </div>
      </NuxtLink>
    </div>
    <div v-observe-visibility="visibilityChanged"></div>
  </div>
</template>

<script setup lang="ts">
import { createSwapy } from 'swapy';
import type { ApiAlbumAlbum } from "../../strapi/types/generated/contentTypes";
const { update } = useStrapi()

const loadedImages = ref<boolean[]>([]);
const container = ref<HTMLDivElement | null>(null)
const user = useState<IUser>('user');
const editMode = useState<boolean>('editMode')

watch(editMode, () => {
  if (editMode.value) initSwapy();
})

const initSwapy = async () => {
  await nextTick();
  if (container.value && editMode.value) {
    let timeout: Timeout;
    const swapy = createSwapy(container.value)
    swapy.onSwap(async ({ data }) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const ids = data.array.map(({ itemId }) => itemId);
        try {
          await update<ApiAlbumAlbum>('albums', albumId, {
            images: {
              set: ids
            }
          })
        } catch (e) {
          console.log(e)
        }
      }, 1000);
    })
  }
}

interface IImageFormat {
  [key: string]: {
    url: string,
    width: number,
    height: number
  }
}

const { link, images, albumId } = defineProps<{
  link: string,
  albumId: string,
  images: {
    id: number
    documentId: string
    title: string
    url: string
    image: {
      formats: IImageFormat
    }
  }[]
}>()
const visibilityChanged = (isVisible: boolean, index?: number) => {
  if (isVisible && index !== undefined) {
    loadedImages.value[index] = true;
  }
};
</script>
