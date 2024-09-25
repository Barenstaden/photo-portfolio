<template>
  <div class="md:flex justify-between">

    <div class="mx-auto px-4 pt-4">

      <img class="h-auto md:h-[70vh] lg:h-[80vh] xl:h-[88vh] mx-auto object-contain rounded" :src="image.image.url" alt="">
      <div class="flex justify-between mt-2">
        <Button class="disabled:text-gray-200 text-blue-500" :disabled="!prevImage"
                @click="navigateTo(`/image/${prevImage?.url}`)">Forrige
        </Button>
        <Button :disabled="!nextImage"
                @click="navigateTo(`/image/${nextImage?.url}`)">Neste
        </Button>
      </div>

    </div>

    <div class="w-full md:w-72 p-4 md:h-[94vh] bg-gray-100 md:overflow-y-auto">
      <div class="grid">
        <h1 class="font-bold">{{ image.title }}</h1>
        <p class="text-sm">{{ image.description }}</p>
        <NuxtLink :to="`/album/${image.album.url}`" class="text-blue-500">{{image.album.title}}</NuxtLink>
      </div>
      <Button v-if="user?.role.type === 'owner' && editMode" :disabled="image.documentId === image.album.cover?.documentId" @click="setCoverImage" class="mt-2">Sett som hovedbilde</Button>
      <div class="mt-4 text-gray-600">
        <h2 class="font-bold ">Kommentarer</h2>
        <div v-if="!image.comments.length">
          <p class="text-sm">Ingen kommentarer enda</p>
        </div>
        <div class="grid gap-2 text-sm">
          <div class="p-4 bg-white shadow-md rounded-lg" v-for="comment in image.comments"
               :key="comment.id">
            <p>{{ comment.comment }}</p>
            <p class="font-bold text-xs">- {{ comment.name }}</p>
          </div>
        </div>
      </div>

      <div v-if="!commentSaved && !error" class="text-gray-600 mt-4">
        <form @submit.prevent="postComment" class="grid gap-2 text-sm">
          <textarea v-model="comment" required class="w-full border-2 rounded-lg p-2" rows="3"
                    placeholder="Skriv en kommentar"></textarea>
          <input v-model="name" required type="text" placeholder="Navn" class="w-full border-2 rounded-lg p-2">
          <Button type="submit">Lagre</Button>
        </form>
      </div>
      <div v-if="error" class="mt-2">
        <p class="font-bold text-red-500 text-sm">Noe gikk galt. Last inn siden på nytt.</p>
      </div>
    </div>
  </div>

  <div class="grid lg:mt-10">
    <h2 class="text-2xl mx-auto">Flere bilder fra albumet</h2>
    <MasonryAlbum :album-id="image.album.documentId" :images="image.album.images" link="image"/>
  </div>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import Modal from "~/components/Modal.vue";
import Button from "~/components/Button.vue";
import {ca} from "cronstrue/dist/i18n/locales/ca";

const image = ref();
const { update, findOne } = useStrapi()
const nextImage = ref<string>();
const prevImage = ref<string>();
const route = useRoute();
const page = ref<number>(6);
const fullScreen = ref(false);
const user = useState('user')
const editMode = useState('editMode')

const comment = ref<string>('');
const name = ref<string>('');
const commentSaved = ref<boolean>(false);
const error = ref<boolean>(false);

try {
  const {data} = await findOne('images', route.params.slug[0])
  image.value = data;
  const {images} = image.value.album;
  const currentImageIndex = images.findIndex(img => img.id === image.value.id);
  nextImage.value = images.find((img, i) => i > currentImageIndex)
  prevImage.value = images.find((img, i) => i === currentImageIndex - 1)
} catch (e) {
  console.log(e)
}

const postComment = async () => {
  try {
    const {data} = await $fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          comment: comment.value,
          name: name.value,
          image: image.value.id
        }
      })
    })
    commentSaved.value = true;
    image.value.comments.push(data);
  } catch (e) {
    error.value = true;
    console.error(e)
  }
}

const setCoverImage = async () => {
  try {
    await update<ApiAlbumAlbum>('albums', image.value.album.documentId, {
      cover: image.value.documentId
    })
    image.value.album.cover.documentId = image.value.documentId;
  } catch (e) {
    console.log(e)
  }
}
</script>
