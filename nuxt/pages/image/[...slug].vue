<template>
  <div class="grid gap-2 p-4 md:grid-cols-3 lg:grid-cols-4">

    <div class="md:col-span-2 lg:col-span-3 px-4 h-[85vh]">

        <img class="h-full shadow-sm mx-auto object-contain rounded align-top" :src="image.image.url" alt="">
        <div :class="`max-w-[${image.image.width}px]`" class="flex justify-between mt-2 bg-white">
          <button class="disabled:text-gray-200 text-blue-500" :disabled="!prevImage"
                  @click="navigateTo(`/image/${prevImage?.url}`)">Forrige
          </button>
          <button class="disabled:text-gray-200 text-blue-500" :disabled="!nextImage"
                  @click="navigateTo(`/image/${nextImage?.url}`)">Neste
          </button>
        </div>

    </div>

    <div class="p-4 bg-gray-100 rounded-lg shadow-sm max-h-[85vh] overflow-scroll">
      <div class="">
        <h1 class="font-bold">{{ image.title }}</h1>
        <p class="text-sm">{{ image.description }}</p>
      </div>

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
          <textarea v-model="comment" required class="w-full border-2 rounded-lg p-2" rows="3" placeholder="Skriv en kommentar"></textarea>
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
    <MasonryAlbum class="columns-4" :images="image.album.images" link="image"/>
  </div>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import Modal from "~/components/Modal.vue";
import Button from "~/components/Button.vue";

const image = ref();
const nextImage = ref<string>();
const prevImage = ref<string>();
const route = useRoute();
const page = ref<number>(6);
const fullScreen = ref(false);

const comment = ref<string>('');
const name = ref<string>('');
const commentSaved = ref<boolean>(false);
const error = ref<boolean>(false);

try {
  const {data} = await useFetch(`/api/images/${route.params.slug[0]}`)
  image.value = data?.value?.data;
  const {images} = image.value.album;
  const currentImageIndex = images.findIndex(img => img.id === image.value.id);
  nextImage.value = images.find((img, i) => i > currentImageIndex)
  prevImage.value = images.find((img, i) => i === currentImageIndex - 1)
} catch (e) {
  console.log(e)
}

const postComment = async () => {
  try {
    const { data } = await $fetch('/api/comments', {
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
</script>
