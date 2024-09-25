<template>
  <div class="grid h-[90vh]">
    <form class="w-64 grid gap-4 m-auto shadow-sm rounded-lg border-2 p-6" @submit.prevent="submitLogin">
      <div class="grid gap-1">
        <input v-model="email" class="border-2 rounded-lg p-2" type="email" placeholder="ola@nordmann.no">
      </div>
      <div class="grid gap-1">
        <input v-model="password" class="border-2 rounded-lg p-2" type="password" placeholder="*********">
      </div>
      <Button type="submit">Logg inn</Button>
    </form>
  </div>
</template>
<script setup lang="ts">
const {login} = useStrapiAuth();
const email = ref('justsendto@me.com');
const password = ref('InnTilOyv1')
const user = useState('user')
const router = useRouter()
const submitLogin = async () => {

  const {user} = await login({
    identifier: email.value,
    password: password.value
  })

  router.push('/')
}
</script>
