<template>
  <div class="h-14 bg-gray-900 text-white px-3 flex justify-between align-middle items-center">
    <div class="hover:text-gray-300">
      <nuxt-link to="/">Øyvind Bjørnstad Foto</nuxt-link>
    </div>
    <div v-if="!user" class="hover:text-gray-300">
      <nuxt-link to="/login">Logg inn</nuxt-link>
    </div>
    <div v-else class="flex space-x-4 items-center">
      <div class="hover:text-gray-300">
        <button @click="submitLogout">Logg ut</button>
      </div>
      <div @click="editMode = !editMode" class="p-2 text-xs border-2 rounded-lg cursor-pointer" v-if="user?.role.type === 'owner'" :class="{
         'bg-yellow-400 border-yellow-400 text-black': editMode
      }">
        {{ editMode ? 'Redigerer' : 'Rediger side'}}
      </div>
    </div>
  </div>
  <slot/>
</template>
<script setup lang="ts">
  const user = useState('user')
  const editMode = useState('editMode');
  const route = useRoute();
  const {logout} = useStrapiAuth()

  const submitLogout = async () => {
    user.value = null;
    logout();
  }

</script>
