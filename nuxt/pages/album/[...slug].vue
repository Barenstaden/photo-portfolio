<template>
  <div v-if="album" class="pb-12">
    <div class="relative h-72 w-full overflow-hidden bg-cover bg-center lg:h-[58vh]"
         :style="{backgroundImage: `url(${coverImageUrl})`}">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>
      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="text-sm font-medium text-white/75 hover:text-white">Album</NuxtLink>
        <div v-if="user?.role?.type === 'owner'" class="flex flex-wrap items-center gap-2">
          <NuxtLink
            :to="`/add-image?mode=existing&album=${album?.documentId}`"
            class="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Legg til bilde
          </NuxtLink>
          <Button type="button" @click="toggleAlbumEditMode">
            {{ reorderImages ? 'Ferdig' : 'Rediger bilder' }}
          </Button>
        </div>
      </div>
    </div>
    <MasonryAlbum
      :albumId="album?.documentId"
      :cover-image-document-id="album?.cover?.documentId"
      :editing="reorderImages"
      :images="album.images"
      link="image"
      @cover-updated="updateCoverImage"
      @deleted="removeDeletedImage"
    />
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
import { useStrapiMediaUrl } from "#imports";

const { findOne } = useStrapi();
const route = useRoute();
const user = useState('user')
const mediaUrl = useStrapiMediaUrl();
const reorderImages = ref(false)

const album = ref();
const coverImageUrl = computed(() => mediaUrl(album.value?.cover?.image?.url));
const fetchAlbum = async () => {
  try {
    const {data} = await findOne<ApiAlbumAlbum>(`albums`, route.params.slug[0])
    album.value = data;
  } catch (e) {
    // console.log(e)
  }
}

const removeDeletedImage = async (documentId: string) => {
  if (!album.value?.images) return;

  album.value.images = album.value.images.filter((image: { documentId: string }) => image.documentId !== documentId);

  if (album.value.cover?.documentId === documentId) {
    await fetchAlbum();
  }
}

const updateCoverImage = (documentId: string) => {
  if (!album.value) return;

  album.value.cover = album.value.images?.find((image: { documentId: string }) => image.documentId === documentId) ?? album.value.cover;
}

const toggleAlbumEditMode = () => {
  reorderImages.value = !reorderImages.value

  if (!reorderImages.value) {
    fetchAlbum()
  }
}

await fetchAlbum();
</script>
