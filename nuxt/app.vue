<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>


<script lang="ts" setup>
  const user = useState('user');
  const {fetchUser} = useStrapiAuth()

  await callOnce(async () => {
    user.value = await fetchUser()
  })
</script>
