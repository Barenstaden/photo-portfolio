<template>
  <div class="mt-6 px-4 sm:px-6 lg:px-8">
    <div
      v-if="isOwner && editing"
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
          <NuxtLink :to="`/${link}/${image.url}`" class="block">
            <Image
              draggable="false"
              :image="image.image"
              :alt="image.title"
              size="small"
              aspect="photo"
              interactive
            />
          </NuxtLink>
          <div class="flex justify-end px-1 py-3 text-sm">
            <button
              type="button"
              data-swapy-handle
              class="cursor-grab touch-none select-none rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 active:cursor-grabbing"
            >
              Flytt
            </button>
          </div>
          <div class="grid gap-2 px-1 pb-2">
            <button
              type="button"
              class="w-full rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              :disabled="coverImageDocumentId === image.documentId || settingCoverImageId === image.documentId"
              @click.stop="setCoverImage(image)"
            >
              {{ coverImageDocumentId === image.documentId ? 'Hovedbilde' : settingCoverImageId === image.documentId ? 'Lagrer...' : 'Bruk som hovedbilde' }}
            </button>
            <button
              type="button"
              class="w-full rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingImageId === image.documentId"
              @click.stop="deleteImage(image)"
            >
              {{ deletingImageId === image.documentId ? 'Sletter...' : 'Slett bilde' }}
            </button>
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
const { update, delete: deleteEntry } = useStrapi()

const loadedImages = ref<boolean[]>([]);
const container = ref<HTMLDivElement | null>(null)
const user = useState<IUser>('user');
const isOwner = computed(() => user.value?.role?.type === 'owner')
const deletingImageId = ref<string | null>(null)
const settingCoverImageId = ref<string | null>(null)
let swapyInstance: ReturnType<typeof createSwapy> | null = null
let swapTimeout: ReturnType<typeof setTimeout> | null = null
const emit = defineEmits<{
  (event: 'deleted', documentId: string): void
  (event: 'cover-updated', documentId: string): void
}>()

const initSwapy = async () => {
  destroySwapy()
  await nextTick();
  if (container.value && editingMode.value) {
    swapyInstance = createSwapy(container.value)
    swapyInstance.onSwap(async ({ data }) => {
      if (swapTimeout) clearTimeout(swapTimeout);
      swapTimeout = setTimeout(async () => {
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

const props = defineProps<{
  link: string,
  albumId: string,
  coverImageDocumentId?: string,
  editing?: boolean,
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

const { link, images, albumId, coverImageDocumentId } = props
const editingMode = computed(() => props.editing ?? false)

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

const deleteImage = async (image: { documentId: string }) => {
  if (!window.confirm('Slette dette bildet? Dette kan ikke angres.')) return;

  deletingImageId.value = image.documentId;

  try {
    if (image.documentId === coverImageDocumentId) {
      const replacement = images.find(item => item.documentId !== image.documentId);

      await update<ApiAlbumAlbum>('albums', albumId, {
        cover: replacement?.documentId ?? null
      })
    }

    await deleteEntry('images', image.documentId);
    emit('deleted', image.documentId);
  } finally {
    deletingImageId.value = null;
  }
}

const setCoverImage = async (image: { documentId: string }) => {
  if (image.documentId === coverImageDocumentId || settingCoverImageId.value) return;

  settingCoverImageId.value = image.documentId;

  try {
    await update<ApiAlbumAlbum>('albums', albumId, {
      cover: image.documentId
    })

    emit('cover-updated', image.documentId);
  } finally {
    settingCoverImageId.value = null;
  }
}

watch(editingMode, async (enabled) => {
  if (enabled) {
    await initSwapy();
    return;
  }

  destroySwapy();
})

onBeforeUnmount(() => {
  destroySwapy();
})

const visibilityChanged = (isVisible: boolean, index?: number) => {
  if (isVisible && index !== undefined) {
    loadedImages.value[index] = true;
  }
};
</script>
