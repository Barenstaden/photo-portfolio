<template>
  <div class="md:grid lg:grid-cols-3 xl:grid-cols-4" v-if="image">
    <div class="lg:col-span-2 xl:col-span-3 w-full px-4 pt-4">

      <img class="h-auto mx-auto object-contain rounded" :src="image?.image.url" alt="">
      <div class="flex justify-between mt-2">
        <Button class="disabled:text-gray-200 text-blue-500" :disabled="!prevImage"
                @click="navigateTo(`/image/${prevImage?.url}`)">Forrige
        </Button>
        <Button :disabled="!nextImage"
                @click="navigateTo(`/image/${nextImage?.url}`)">Neste
        </Button>
      </div>

    </div>

    <div class="mt-2 lg:mt-0 p-4 bg-gray-100 lg:overflow-y-auto h-auto">
      <div class="grid">
        <p v-if="image?.description" class="text-sm">{{ image?.description }}</p>
        <NuxtLink :to="`/album/${image?.album.url}`" class="text-blue-500">{{image?.album.title}}</NuxtLink>
      </div>
      <Button v-if="user?.role.type === 'owner' && editMode" :disabled="image?.documentId === image?.album.cover?.documentId" @click="setCoverImage" class="mt-2">Sett som hovedbilde</Button>
      <div class="mt-4 text-gray-600">
        <h2 class="font-bold ">Kommentarer</h2>
        <div v-if="!image?.comments.length">
          <p class="text-sm">Ingen kommentarer enda</p>
        </div>
        <div class="grid gap-2 text-sm">
          <div class="p-4 bg-white shadow-md rounded-lg" v-for="comment in image?.comments"
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
          <input :disabled="user" v-model="name" required type="text" placeholder="Navn" class="w-full border-2 rounded-lg p-2">
          <Button type="submit">Lagre</Button>
        </form>
      </div>
      <div v-if="error" class="mt-2">
        <p class="font-bold text-red-500 text-sm">Noe gikk galt. Last inn siden på nytt.</p>
      </div>
    </div>
  </div>

  <div class="grid lg:mt-10" v-if="image?.album">
    <h2 class="text-2xl mx-auto">Flere bilder fra albumet</h2>
    <MasonryAlbum :album-id="image?.album.documentId" :images="image?.album.images" link="image"/>
  </div>

  <div v-if="!image" class="grid h-lvh place-content-center gap-4">
    <h1 class="m-auto text-2xl">Dette bildet finnes ikke</h1>
    <Button><nuxt-link to="/">Gå til forsiden</nuxt-link></Button>
  </div>


</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import Button from "~/components/Button.vue";

const image = ref();
const { update, findOne, create } = useStrapi()
const nextImage = ref<string>();
const prevImage = ref<string>();
const route = useRoute();
const page = ref<number>(6);
const fullScreen = ref(false);
const user = useState('user')
const editMode = useState('editMode')

const comment = ref<string>('');
const name = ref<string>(user.value?.firstName ?? '');
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
  image.value = null;
}

const postComment = async () => {
  try {
    const {data} = await create('comments', {
          comment: comment.value,
          name: name.value,
          image: image.value.id,
          user: user.value?.documentId
    })
    commentSaved.value = true;
    image.value.comments.push(data);
  } catch (e) {
    error.value = true;
  }
}

const setCoverImage = async () => {
  try {
    await update<ApiAlbumAlbum>('albums', image.value.album.documentId, {
      cover: image.value.documentId
    })
    image.value.album.cover.documentId = image.value.documentId;
  } catch (e) {
  }
}
</script>
