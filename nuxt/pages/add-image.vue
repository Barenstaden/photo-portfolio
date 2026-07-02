<template>
  <div class="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <div v-if="!isOwner" class="grid min-h-[50vh] place-items-center text-center">
      <div class="grid gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Logg inn for å legge til bilder</h1>
        <Button>
          <NuxtLink to="/login">Logg inn</NuxtLink>
        </Button>
      </div>
    </div>

    <form v-else class="grid gap-8" @submit.prevent="submitImages">
      <section class="grid gap-5">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-gray-900">Legg til nytt bilde</h1>
          <p class="mt-2 text-sm text-gray-500">Velg album, last opp ett eller flere bilder, og juster tekst før publisering.</p>
        </div>

        <div class="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <label class="grid gap-2 text-sm font-medium text-gray-700">
            Album
            <select
              v-model="albumMode"
              class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-gray-500"
            >
              <option value="existing">Velg eksisterende album</option>
              <option value="new">Opprett nytt album</option>
            </select>
          </label>

          <label v-if="albumMode === 'existing'" class="grid gap-2 text-sm font-medium text-gray-700">
            Eksisterende album
            <select
              v-model="selectedAlbumDocumentId"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-gray-500"
            >
              <option disabled value="">Velg album</option>
              <option v-for="album in albums" :key="album.documentId" :value="album.documentId">
                {{ album.title }}
              </option>
            </select>
          </label>

          <div v-else class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2 text-sm font-medium text-gray-700">
              Navn på album
              <input
                v-model="newAlbumTitle"
                required
                class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-gray-500"
                placeholder='For eksempel "People"'
              >
            </label>
            <label class="grid gap-2 text-sm font-medium text-gray-700">
              Albumtekst
              <textarea
                v-model="newAlbumDescription"
                class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-gray-500"
                placeholder="Valgfritt"
              ></textarea>
            </label>
          </div>
        </div>
      </section>

      <section class="grid gap-4">
        <label class="grid cursor-pointer gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-gray-500">
          <span class="text-base font-medium text-gray-900">Velg bilder</span>
          <input type="file" accept="image/*" multiple class="sr-only" @change="handleFiles">
        </label>

        <div v-if="queuedImages.length" class="grid gap-4">
          <article
            v-for="item in queuedImages"
            :key="item.id"
            class="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[12rem_minmax(0,1fr)]"
          >
            <img :src="item.previewUrl" :alt="item.file.name" class="aspect-[4/3] w-full rounded-lg object-cover">
            <div class="grid gap-3">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-gray-900">{{ item.file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(item.file.size) }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-200"
                  @click="removeImage(item.id)"
                >
                  Fjern
                </button>
              </div>

              <label class="grid gap-2 text-sm font-medium text-gray-700">
                Beskrivelse
                <textarea
                  v-model="item.description"
                  rows="5"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-gray-500"
                  placeholder="Skriv en beskrivelse"
                ></textarea>
              </label>
            </div>
          </article>
        </div>
      </section>

      <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
        {{ error }}
      </div>

      <div v-if="status" class="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
        {{ status }}
      </div>

      <div class="flex flex-wrap gap-3">
        <Button type="submit" :disabled="saving || !queuedImages.length">
          {{ saving ? 'Publiserer...' : 'Publiser bilder' }}
        </Button>
        <Button type="button" :disabled="saving" @click="resetForm">Tøm skjema</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'

type AlbumOption = {
  id: number
  documentId: string
  title: string
  cover?: {
    documentId?: string
  }
}

type QueuedImage = {
  id: string
  file: File
  previewUrl: string
  description: string
}

const user = useState<any>('user')
const isOwner = computed(() => user.value?.role?.type === 'owner')
const { find, create } = useStrapi()
const strapiClient = useStrapiClient()
const route = useRoute()
const router = useRouter()

const albums = ref<AlbumOption[]>([])
const albumMode = ref<'existing' | 'new'>('existing')
const selectedAlbumDocumentId = ref('')
const newAlbumTitle = ref('')
const newAlbumDescription = ref('')
const queuedImages = ref<QueuedImage[]>([])
const saving = ref(false)
const error = ref('')
const status = ref('')

const applyQueryDefaults = () => {
  const mode = route.query.mode
  const album = route.query.album

  if (mode === 'new') {
    albumMode.value = 'new'
    return
  }

  if (mode === 'existing' || album) {
    albumMode.value = 'existing'
  }

  if (typeof album === 'string' && album) {
    selectedAlbumDocumentId.value = album
  }
}

const fetchAlbums = async () => {
  if (!isOwner.value) return

  const { data } = await find<AlbumOption>('albums', {
    sort: 'order',
    pagination: {
      limit: 100
    },
    populate: {
      cover: true
    }
  })

  albums.value = data
  selectedAlbumDocumentId.value = selectedAlbumDocumentId.value || data[0]?.documentId || ''
  applyQueryDefaults()
}

await fetchAlbums()

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const createTechnicalTitle = (file: File, index: number) => {
  const baseName = file.name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `${baseName || 'bilde'}-${Date.now()}-${index + 1}`
}

const handleFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''

  for (const file of files) {
    const item: QueuedImage = {
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      description: ''
    }

    queuedImages.value.push(item)
  }
}

const removeImage = (id: string) => {
  const item = queuedImages.value.find(image => image.id === id)
  if (item) URL.revokeObjectURL(item.previewUrl)

  queuedImages.value = queuedImages.value.filter(image => image.id !== id)
}

const resetForm = () => {
  queuedImages.value.forEach(item => URL.revokeObjectURL(item.previewUrl))
  queuedImages.value = []
  error.value = ''
  status.value = ''
}

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('files', file)

  return await strapiClient('/upload', {
    method: 'POST',
    body: formData
  }) as Array<{ id: number }>
}

const resolveAlbumDocumentId = async () => {
  if (albumMode.value === 'existing') return selectedAlbumDocumentId.value

  const { data } = await create<AlbumOption>('albums', {
    title: newAlbumTitle.value,
    description: newAlbumDescription.value,
    publishedAt: new Date().toISOString(),
    order: albums.value.length
  })

  return data.documentId
}

const submitImages = async () => {
  if (!queuedImages.value.length || saving.value) return

  saving.value = true
  error.value = ''
  status.value = 'Starter opplasting...'

  try {
    const albumDocumentId = await resolveAlbumDocumentId()
    const createdImages: Array<{ documentId: string, url: string }> = []

    for (const [index, item] of queuedImages.value.entries()) {
      status.value = `Laster opp ${index + 1} av ${queuedImages.value.length}...`
      const uploadedFiles = await uploadFile(item.file)
      const uploadedFile = uploadedFiles[0]

      const { data } = await create<{ documentId: string, url: string }>('images', {
        title: createTechnicalTitle(item.file, index),
        description: item.description,
        image: uploadedFile.id,
        album: albumDocumentId,
        publishedAt: new Date().toISOString()
      })

      createdImages.push(data)
    }

    resetForm()
    status.value = 'Bildene er publisert.'

    if (createdImages[0]?.url) {
      await router.push(`/image/${createdImages[0].url}`)
    }
  } catch (e) {
    error.value = 'Noe gikk galt under opplasting. Kontroller album, bilde og innlogging før du prøver igjen.'
  } finally {
    saving.value = false
  }
}
</script>
