<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>


<script lang="ts" setup>
  import {populate} from "assets/js/populate-from-server";

  onMounted(() => {
    // populate();
  })
</script>
