<template>
  <div class="grid h-[90vh]">
    <form class="w-64 grid gap-4 m-auto shadow-sm rounded-lg border-2 p-6" @submit.prevent="submitLogin">
      <div class="grid gap-1">
        <input v-model="identifier" class="border-2 rounded-lg p-2" type="text" placeholder="Brukernavn">
      </div>
      <div class="grid gap-1">
        <input v-model="password" class="border-2 rounded-lg p-2" type="password" placeholder="Passord">
      </div>
      <Button :disabled="loading" type="submit">{{ loading ? 'Logger inn...' : 'Logg inn'}}</Button>
      <p v-if="error" class="text-red-600">{{ error }}</p>
    </form>
  </div>
</template>
<script setup lang="ts">

const {login} = useStrapiAuth();
const identifier = ref('');
const password = ref('')
const user = useState('user')
const router = useRouter()
const loading = ref(false);
const error = ref();
const submitLogin = async () => {
  loading.value = true;
  try {
    const {user: userData} = await login({
      identifier: identifier.value,
      password: password.value
    })
    user.value = userData;
    router.back()
  } catch (e) {
    error.value = "Feil brukernavn eller passord";
  }
  loading.value = false;
}
</script>
