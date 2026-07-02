<template>
  <div class="h-14 bg-gray-900 text-white px-3 flex justify-between align-middle items-center">
    <div class="hover:text-gray-300">
      <nuxt-link to="/">Øyvind Bjørnstad Foto</nuxt-link>
    </div>
    <div v-if="!user" class="hover:text-gray-300">
      <nuxt-link to="/login">Logg inn</nuxt-link>
    </div>
    <div v-else class="flex flex-wrap items-center justify-end gap-3">
      <NuxtLink
        v-if="user?.role.type === 'owner'"
        to="/add-image"
        class="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
      >
        Legg til nytt bilde
      </NuxtLink>
      <NuxtLink
        v-if="user?.role.type === 'owner'"
        to="/comments"
        class="relative inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 17H9m9-2v-4a6 6 0 0 0-12 0v4l-2 2h16l-2-2Zm-4 4a2 2 0 0 1-4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kommentarer
        <span
          v-if="notificationCount"
          class="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white"
        >
          {{ notificationCount }}
        </span>
      </NuxtLink>
      <div class="hover:text-gray-300">
        <button @click="submitLogout">Logg ut</button>
      </div>
    </div>
  </div>
  <slot/>
</template>
<script setup lang="ts">
  import type {ApiCommentComment} from "../../strapi/types/generated/contentTypes";

  const { find } = useStrapi();
  const user = useState('user')
  const {logout} = useStrapiAuth()
  const notifications = ref();

  const notificationCount = computed(() => {
    const currentUserId = (user.value as any)?.documentId ?? (user.value as any)?.id;

    return (notifications.value ?? []).filter((comment: any) => {
      const commentUserId = comment.user?.documentId ?? comment.user?.id;

      return !commentUserId || commentUserId !== currentUserId;
    }).length;
  })

  try {
    if (user.value?.role?.type === 'owner') {
      const { data } = await find<ApiCommentComment>('comments', {
        filters: {
          read: {
            $eq: false
          }
        },
        sort: 'createdAt:desc',
        pagination: {
          limit: 100
        },
        populate: {
          user: true
        }
      })
      notifications.value = data;
    } else {
      notifications.value = [];
    }
  } catch (e) {
    notifications.value = [];
  }

  const submitLogout = async () => {
    user.value = null;
    logout();
  }

</script>
