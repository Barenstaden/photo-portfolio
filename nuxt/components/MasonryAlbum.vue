<template>
  <MasonryGrid class="mt-4 px-4" v-if="user?.role.type === 'owner' && editMode">
    <div ref="container">
      <div :data-swapy-slot="index" class="relative mb-4" :href="`/${link}/${image.url}`" v-for="(image, index) in images" :key="image.id">
        <div :data-swapy-item="image.documentId">
          <Image data-swapy-handle draggable="false"
                 :image="image.image"
                 size="small"/>
        </div>
      </div>
    </div>
  </MasonryGrid>

  <MasonryGrid v-else class="mt-4 px-4">
    <a class="relative mb-4" :href="`/${link}/${image.url}`" v-for="(image, index) in images" :key="image.id">
        <Image draggable="false"
             v-observe-visibility="(isVisible) => visibilityChanged(isVisible, index)"
             :image="image.image"
             :size="loadedImages[index] ? 'small' : 'thumbnail'"/>
    </a>
  </MasonryGrid>
  <div v-observe-visibility="visibilityChanged"></div>
</template>

<script setup lang="ts">
import { createSwapy } from 'swapy';
import type {ApiAlbumAlbum} from "../../strapi/types/generated/contentTypes";
const {update} = useStrapi()

const loadedImages = ref([]);
const container = ref<HTMLDivElement | null>(null)
const user = useState('user');
const editMode = useState('editMode')

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
        const ids = data.array.map(({itemId}) => itemId);
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

const {link, images, albumId} = defineProps<{
  link: string,
  albumId: string,
  images: {
    id: number
    title: string
    image: {
      formats: IImageFormat
    }
  }[]
}>()
const visibilityChanged = (isVisible: boolean, index: number) => {
  if (isVisible) {
    loadedImages.value[index] = true;
  }
};
</script>
