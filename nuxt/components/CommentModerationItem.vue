<template>
  <article class="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[9rem_minmax(0,1fr)]">
    <NuxtLink
      :to="comment.image?.url ? `/image/${comment.image.url}?comments=1` : '/comments'"
      class="block overflow-hidden rounded-lg bg-gray-100"
    >
      <img v-if="imageUrl" :src="imageUrl" alt="" class="aspect-[4/3] w-full object-cover">
      <div v-else class="grid aspect-[4/3] place-items-center text-sm text-gray-400">Bilde mangler</div>
    </NuxtLink>

    <div class="grid gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm">
          <p class="font-semibold text-gray-900">{{ comment.name || 'Ukjent' }}</p>
          <p v-if="formattedDate" class="text-xs text-gray-500">{{ formattedDate }}</p>
        </div>
        <NuxtLink
          v-if="comment.image?.url"
          :to="`/image/${comment.image.url}?comments=1`"
          class="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Gå til bildet
        </NuxtLink>
      </div>

      <p class="whitespace-pre-line text-sm leading-6 text-gray-700">{{ comment.comment }}</p>

      <div v-if="hasAnswer" class="rounded-lg bg-gray-50 p-3 text-sm">
        <p class="font-semibold text-gray-900">Svar</p>
        <p class="mt-1 whitespace-pre-line leading-6 text-gray-700">{{ comment.answer }}</p>
      </div>

      <form v-else class="grid gap-3" @submit.prevent="$emit('save')">
        <textarea
          :value="replyText"
          required
          rows="3"
          placeholder="Skriv svar"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500"
          @input="updateReplyText"
        ></textarea>
        <Button type="submit" :disabled="saving">{{ saving ? 'Lagrer...' : 'Lagre svar' }}</Button>
      </form>
    </div>
  </article>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'

const props = defineProps<{
  comment: {
    id: number
    documentId?: string
    name?: string
    comment?: string
    answer?: string
    createdAt?: string
    image?: {
      url?: string
      image?: {
        url?: string
      }
    }
  }
  replyText?: string
  saving?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:replyText', value: string): void
  (event: 'save'): void
}>()

const mediaUrl = useStrapiMediaUrl()
const imageUrl = computed(() => mediaUrl(props.comment.image?.image?.url))
const hasAnswer = computed(() => Boolean(props.comment.answer?.trim()))
const updateReplyText = (event: Event) => {
  emit('update:replyText', (event.target as HTMLTextAreaElement).value)
}
const formattedDate = computed(() => {
  if (!props.comment.createdAt) return ''

  return new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(props.comment.createdAt))
})
</script>
