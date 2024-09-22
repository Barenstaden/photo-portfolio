<template>
  <div class="grid gap-2 p-4 md:grid-cols-3 lg:grid-cols-4">

    <div class="md:col-span-2 lg:col-span-3 pb-4">

      <div>
        <img class="max-h-[85vh] shadow-sm mx-auto object-contain rounded align-top" :src="image.image.url" alt="">
        <div class="flex justify-between mb-4 h-10 bg-white">
          <button class="disabled:text-gray-200 text-blue-500" :disabled="!prevImage"
                  @click="navigateTo(`/image/${prevImage?.url}`)">Forrige
          </button>
          <button class="disabled:text-gray-200 text-blue-500" :disabled="!nextImage"
                  @click="navigateTo(`/image/${nextImage?.url}`)">Neste
          </button>
        </div>

      </div>
    </div>

    <div class="p-4 bg-gray-100 rounded-lg shadow-sm max-h-lvh">
      <div class="">
        <h1 class="font-bold">{{ image.title }}</h1>
        <p class="text-sm">{{ image.description }}</p>
      </div>

      <div class="mt-4 text-gray-600">
        <h2 class="font-bold ">Kommentarer</h2>
        <div v-if="!image.comments.length">
          <p class="text-sm">Ingen kommentarer enda</p>
        </div>
        <div class="mt-2 p-4 grid gap-4 bg-white shadow-md rounded-lg" v-for="comment in image.comments"
             :key="comment.id">
          <p class="font-bold">{{ comment.name }}</p>
          <p class="text-sm">{{ comment.comment }}</p>
        </div>
      </div>

      <div class="text-gray-600 mt-4">
        <form @submit.prevent="postComment" class="grid gap-2 text-sm">
          <textarea v-model="comment" required class="w-full border-2 rounded-lg p-2" rows="3" placeholder="Skriv en kommentar"></textarea>
          <input v-model="name" required type="text" placeholder="Navn" class="w-full border-2 rounded-lg p-2">
          <input v-model="email" required type="email" placeholder="E-post" class="w-full border-2 rounded-lg p-2">
          <Button type="submit">Lagre</Button>
        </form>
      </div>
    </div>
  </div>

  <div class="grid mt-10">
    <h2 class="text-2xl mx-auto">Flere bilder fra albumet</h2>
    <MasonryAlbum :images="image.album.images" link="image"/>
  </div>

</template>

<script setup lang="ts">

import MasonryAlbum from "~/componets/MasonryAlbum.vue";
import Modal from "~/componets/Modal.vue";
import Button from "~/componets/Button.vue";

const image = ref();
const nextImage = ref();
const prevImage = ref();
const route = useRoute();
const page = ref(6);
const fullScreen = ref(false);

const comment = ref('Flott bilde!');
const name = ref('Thomas');
const email = ref('justsendto@me.com');

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
  console.log(comment.value, name.value, email.value)

}
</script>
