<template>
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <div v-if="!isOwner" class="grid min-h-[50vh] place-items-center text-center">
      <div class="grid gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Logg inn for å se kommentarer</h1>
        <Button>
          <NuxtLink to="/login">Logg inn</NuxtLink>
        </Button>
      </div>
    </div>

    <div v-else class="grid gap-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-gray-900">Kommentarer</h1>
          <p class="mt-2 text-sm text-gray-500">Nye kommentarer fra andre brukere med lenke direkte til bildet.</p>
        </div>
        <Button @click="fetchComments">Oppdater</Button>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg bg-gray-900 p-4 text-white">
          <p class="text-sm text-gray-300">Nye kommentarer</p>
          <p class="mt-2 text-3xl font-semibold">{{ newComments.length }}</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p class="text-sm text-gray-500">Hentet</p>
          <p class="mt-2 text-3xl font-semibold text-gray-900">{{ comments.length }}</p>
        </div>
      </div>

      <section class="grid gap-4">
        <h2 class="text-xl font-semibold text-gray-900">Nye kommentarer</h2>
        <div v-if="!newComments.length" class="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
          Ingen nye kommentarer fra andre brukere.
        </div>
        <CommentModerationItem
          v-for="comment in newComments"
          :key="comment.documentId ?? comment.id"
          :comment="comment"
          :reply-text="replyDrafts[comment.documentId ?? comment.id] ?? ''"
          :saving="savingReplyId === (comment.documentId ?? comment.id)"
          @update:reply-text="replyDrafts[comment.documentId ?? comment.id] = $event"
          @save="saveReply(comment)"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import CommentModerationItem from '~/components/CommentModerationItem.vue'

type PortfolioComment = {
  id: number
  documentId?: string
  name?: string
  comment?: string
  answer?: string
  createdAt?: string
  user?: {
    id?: number
    documentId?: string
  } | null
  image?: {
    url?: string
    title?: string
    image?: {
      url?: string
    }
    album?: {
      title?: string
    }
  }
}

const user = useState<any>('user')
const isOwner = computed(() => user.value?.role?.type === 'owner')
const { find, update } = useStrapi()
const comments = ref<PortfolioComment[]>([])
const replyDrafts = reactive<Record<string, string>>({})
const savingReplyId = ref<string | number | null>(null)

const isOwnComment = (comment: PortfolioComment) => {
  const currentUserId = user.value?.documentId ?? user.value?.id
  const commentUserId = comment.user?.documentId ?? comment.user?.id

  return Boolean(currentUserId && commentUserId && currentUserId === commentUserId)
}

const newComments = computed(() => comments.value.filter(comment => !isOwnComment(comment)))

const fetchComments = async () => {
  if (!isOwner.value) return

  const { data } = await find<PortfolioComment>('comments', {
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
      user: true,
      image: {
        populate: {
          image: true,
          album: true
        }
      }
    }
  })

  comments.value = data
}

await fetchComments()

const saveReply = async (comment: PortfolioComment) => {
  const commentId = comment.documentId ?? comment.id
  const reply = replyDrafts[commentId]?.trim()
  if (!reply) return

  savingReplyId.value = commentId

  try {
    await update('comments', commentId, {
      answer: reply,
      answeredAt: new Date().toISOString(),
      read: true
    })

    comment.answer = reply
    replyDrafts[commentId] = ''
  } finally {
    savingReplyId.value = null
  }
}
</script>
