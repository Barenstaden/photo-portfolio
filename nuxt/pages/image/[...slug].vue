<template>
  <div v-if="image" class="bg-gray-50 pb-12">
    <div
      class="grid min-h-[calc(100vh-3rem)] gap-0 px-0 py-0 sm:gap-4 sm:px-6 sm:py-6 lg:px-8"
      :class="commentsOpen ? 'lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]' : ''"
    >
      <section
        ref="normalSwipeFrame"
        class="relative h-[64svh] min-h-[26rem] min-w-0 touch-pan-y bg-gray-100 sm:grid sm:h-[calc(100svh-7rem)] sm:min-h-[60vh] sm:place-items-center sm:bg-transparent"
        @mousedown="startMouseSwipe"
        @mousemove="moveMouseSwipe"
        @mouseup="finishMouseSwipe"
        @mouseleave="cancelMouseSwipe"
        @touchstart.passive="startImageSwipe"
        @touchmove.passive="moveImageSwipe"
        @touchend="finishImageSwipe"
      >
        <div
          class="h-full w-full overflow-hidden sm:overflow-visible"
        >
          <div class="h-full w-full overflow-hidden">
            <div
              class="flex h-full w-full items-center"
              :class="imageTrackClass"
              :style="imageTrackStyle"
            >
              <div class="grid h-full w-full shrink-0 place-items-center sm:px-8">
                <div
                  v-if="prevImage?.image?.url"
                  class="inline-flex max-h-[64svh] max-w-full sm:max-h-[calc(100svh-7rem)]"
                >
                  <img
                    class="h-full max-h-[64svh] max-w-full cursor-zoom-in object-contain sm:h-auto sm:w-auto sm:max-h-[calc(100svh-7rem)] sm:shadow-[0_8px_16px_rgba(15,23,42,0.28)]"
                    :src="prevImage.image.url"
                    :alt="prevImage.title ?? ''"
                    @click="openFullScreenFromImage"
                  >
                </div>
              </div>
              <div class="grid h-full w-full shrink-0 place-items-center sm:px-8">
                <div class="inline-flex max-h-[64svh] max-w-full sm:max-h-[calc(100svh-7rem)]">
                  <img
                    class="h-full max-h-[64svh] max-w-full cursor-zoom-in object-contain sm:h-auto sm:w-auto sm:max-h-[calc(100svh-7rem)] sm:shadow-[0_8px_16px_rgba(15,23,42,0.28)]"
                    :src="image?.image.url"
                    :alt="image?.title ?? ''"
                    @click="openFullScreenFromImage"
                  >
                </div>
              </div>
              <div class="grid h-full w-full shrink-0 place-items-center sm:px-8">
                <div
                  v-if="nextImage?.image?.url"
                  class="inline-flex max-h-[64svh] max-w-full sm:max-h-[calc(100svh-7rem)]"
                >
                  <img
                    class="h-full max-h-[64svh] max-w-full cursor-zoom-in object-contain sm:h-auto sm:w-auto sm:max-h-[calc(100svh-7rem)] sm:shadow-[0_8px_16px_rgba(15,23,42,0.28)]"
                    :src="nextImage.image.url"
                    :alt="nextImage.title ?? ''"
                    @click="openFullScreenFromImage"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="absolute right-3 top-3 z-30 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg transition hover:bg-white"
          aria-label="Vis bildet i fullskjerm"
          @click="openFullScreen"
        >
          Fullskjerm
        </button>
        <button
          type="button"
          class="absolute left-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-gray-900 shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:grid"
          :disabled="!prevImage"
          aria-label="Forrige bilde"
          @click="animateToImage(prevImage)"
        >
          &larr;
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-gray-900 shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:grid"
          :disabled="!nextImage"
          aria-label="Neste bilde"
          @click="animateToImage(nextImage)"
        >
          &rarr;
        </button>
        <div class="absolute bottom-3 left-3 z-30 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-lg sm:left-1/2 sm:-translate-x-1/2">
          <span>{{ currentImageIndex + 1 }} av {{ galleryCount }}</span>
        </div>
      </section>

      <aside
        v-if="commentsOpen"
        class="min-h-0 overflow-y-auto bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-5 sm:shadow-xl lg:max-h-[calc(100vh-5rem)]"
      >
        <div class="grid gap-3">
          <NuxtLink :to="`/album/${image?.album.url}`" class="text-sm font-medium text-blue-600 hover:text-blue-800">
            {{image?.album.title}}
          </NuxtLink>
          <p v-if="image?.description" class="text-sm leading-6 text-gray-600">{{ image?.description }}</p>
        </div>

        <Button
          v-if="user?.role.type === 'owner' && editMode"
          :disabled="image?.documentId === image?.album.cover?.documentId"
          @click="setCoverImage"
          class="mt-4"
        >
          Sett som hovedbilde
        </Button>

        <div class="mt-6 text-gray-700">
          <h2 class="text-base font-semibold text-gray-900">Kommentarer</h2>
          <div v-if="!image?.comments.length" class="mt-2 rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">Ingen kommentarer enda</p>
          </div>
          <div class="mt-3 grid gap-3 text-sm">
            <div
              class="rounded-xl bg-gray-50 p-4 ring-1 ring-black/5"
              v-for="comment in image?.comments"
              :key="comment.id"
            >
              <p class="leading-6 text-gray-700">{{ comment.comment }}</p>
              <p class="mt-2 text-xs font-semibold text-gray-500">- {{ comment.name }}</p>
            </div>
          </div>
        </div>

        <div v-if="!commentSaved && !error" class="mt-6 text-gray-600">
          <form @submit.prevent="postComment" class="grid gap-3 text-sm">
          <textarea
            v-model="comment"
            required
            class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-gray-400"
            rows="4"
            placeholder="Skriv en kommentar"
          ></textarea>
            <input
              :disabled="user"
              v-model="name"
              required
              type="text"
              placeholder="Navn"
              class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-gray-400 disabled:bg-gray-50"
            >
          <Button type="submit">Lagre</Button>
          </form>
        </div>
        <div v-if="error" class="mt-3 rounded-xl bg-red-50 p-4">
          <p class="text-sm font-semibold text-red-600">Noe gikk galt. Last inn siden på nytt.</p>
        </div>
      </aside>
    </div>

    <div class="mt-6" v-if="image?.album">
      <div class="px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold tracking-tight text-gray-900">Flere bilder fra albumet</h2>
      </div>
      <MasonryAlbum :album-id="image?.album.documentId" :images="image?.album.images" link="image"/>
    </div>

    <div
      v-if="fullScreen"
      class="fixed inset-0 z-50 bg-gray-50"
      @mousemove="showFullScreenControls"
      @click.self="closeFullScreen"
    >
      <button
        type="button"
        class="absolute right-4 top-4 z-40 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg transition duration-300 hover:bg-white"
        :class="controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'"
        aria-label="Lukk fullskjerm"
        @click="closeFullScreen"
      >
        Lukk
      </button>
      <div
        class="grid h-full gap-4"
        :class="fullScreenCommentsOpen ? 'lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]' : ''"
      >
        <div
          ref="fullScreenSwipeFrame"
          class="relative grid min-h-0 touch-pan-y place-items-center overflow-hidden border border-white/80 shadow-[0_28px_90px_rgba(15,23,42,0.35)]"
          @mousedown="startMouseSwipe"
          @mousemove="moveMouseSwipe"
          @mouseup="finishMouseSwipe"
          @mouseleave="cancelMouseSwipe"
          @touchstart.passive="startImageSwipe"
          @touchmove.passive="moveImageSwipe"
          @touchend="finishImageSwipe"
        >
          <div
            class="flex h-full w-full items-center"
            :class="imageTrackClass"
            :style="imageTrackStyle"
          >
            <div class="grid h-full w-full shrink-0 place-items-center">
              <img
                v-if="prevImage?.image?.url"
                class="h-full max-h-[calc(100svh-3rem)] max-w-full object-contain sm:max-h-[calc(100vh-4rem)]"
                :src="prevImage.image.url"
                :alt="prevImage.title ?? ''"
                @click="showMobileNavigationControlsFromImage"
              >
            </div>
            <div class="grid h-full w-full shrink-0 place-items-center">
              <img
                class="h-full max-h-[calc(100svh-3rem)] max-w-full object-contain sm:max-h-[calc(100vh-4rem)]"
                :src="image?.image.url"
                :alt="image?.title ?? ''"
                @click="showMobileNavigationControlsFromImage"
              >
            </div>
            <div class="grid h-full w-full shrink-0 place-items-center">
              <img
                v-if="nextImage?.image?.url"
                class="h-full max-h-[calc(100svh-3rem)] max-w-full object-contain sm:max-h-[calc(100vh-4rem)]"
                :src="nextImage.image.url"
                :alt="nextImage.title ?? ''"
                @click="showMobileNavigationControlsFromImage"
              >
            </div>
          </div>
          <button
            v-if="!fullScreenCommentsOpen"
            type="button"
            class="absolute bottom-3 right-3 z-20 rounded-full bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur transition hover:bg-white"
            @click="fullScreenCommentsOpen = true"
          >
            {{ commentLabel }}
          </button>
          <button
            v-if="prevImage"
            type="button"
            class="absolute left-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-gray-900 shadow-lg transition duration-300 hover:bg-white"
            :class="[
              controlsVisible ? 'sm:translate-x-0 sm:opacity-100' : 'sm:-translate-x-3 sm:opacity-0 sm:pointer-events-none',
              mobileNavigationVisible ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0 pointer-events-none sm:pointer-events-auto'
            ]"
            aria-label="Forrige bilde"
            @click="animateToImage(prevImage, true)"
          >
            &larr;
          </button>
          <button
            v-if="nextImage"
            type="button"
            class="absolute right-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-gray-900 shadow-lg transition duration-300 hover:bg-white"
            :class="[
              controlsVisible ? 'sm:translate-x-0 sm:opacity-100' : 'sm:translate-x-3 sm:opacity-0 sm:pointer-events-none',
              mobileNavigationVisible ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0 pointer-events-none sm:pointer-events-auto'
            ]"
            aria-label="Neste bilde"
            @click="animateToImage(nextImage, true)"
          >
            &rarr;
          </button>
          <div
            class="absolute bottom-3 left-3 z-30 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-lg transition duration-300 sm:left-1/2 sm:-translate-x-1/2"
            :class="controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'"
          >
            <span>{{ currentImageIndex + 1 }} av {{ galleryCount }}</span>
          </div>
        </div>

        <aside
          v-if="fullScreenCommentsOpen"
          class="min-h-0 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5"
        >
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-xl leading-none text-gray-700 transition hover:bg-gray-200"
              aria-label="Lukk kommentarer"
              @click="fullScreenCommentsOpen = false"
            >
              &times;
            </button>
          </div>
          <div class="grid gap-3">
            <NuxtLink :to="`/album/${image?.album.url}`" class="text-sm font-medium text-blue-600 hover:text-blue-800">
              {{image?.album.title}}
            </NuxtLink>
            <p v-if="image?.description" class="text-sm leading-6 text-gray-600">{{ image?.description }}</p>
          </div>

          <div class="mt-6 text-gray-700">
            <h2 class="text-base font-semibold text-gray-900">Kommentarer</h2>
            <div v-if="!image?.comments.length" class="mt-2 rounded-xl bg-gray-50 p-4">
              <p class="text-sm text-gray-500">Ingen kommentarer enda</p>
            </div>
            <div class="mt-3 grid gap-3 text-sm">
              <div
                class="rounded-xl bg-gray-50 p-4 ring-1 ring-black/5"
                v-for="comment in image?.comments"
                :key="comment.id"
              >
                <p class="leading-6 text-gray-700">{{ comment.comment }}</p>
                <p class="mt-2 text-xs font-semibold text-gray-500">- {{ comment.name }}</p>
              </div>
            </div>
          </div>

          <div v-if="!commentSaved && !error" class="mt-6 text-gray-600">
            <form @submit.prevent="postComment" class="grid gap-3 text-sm">
            <textarea
              v-model="comment"
              required
              class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-gray-400"
              rows="4"
              placeholder="Skriv en kommentar"
            ></textarea>
              <input
                :disabled="user"
                v-model="name"
                required
                type="text"
                placeholder="Navn"
                class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-gray-400 disabled:bg-gray-50"
              >
            <Button type="submit">Lagre</Button>
            </form>
          </div>
          <div v-if="error" class="mt-3 rounded-xl bg-red-50 p-4">
            <p class="text-sm font-semibold text-red-600">Noe gikk galt. Last inn siden på nytt.</p>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <div v-if="!image" class="grid h-lvh place-content-center gap-4">
    <h1 class="m-auto text-2xl">Dette bildet finnes ikke</h1>
    <Button><nuxt-link to="/">Gå til forsiden</nuxt-link></Button>
  </div>


</template>

<script setup lang="ts">

import MasonryAlbum from "~/components/MasonryAlbum.vue";
import Button from "~/components/Button.vue";
import type { ApiAlbumAlbum } from "../../../strapi/types/generated/contentTypes";

const image = ref();
const { update, findOne, create } = useStrapi()
const nextImage = ref<GalleryImage | null>(null);
const prevImage = ref<GalleryImage | null>(null);
const currentImageIndex = ref(0);
const route = useRoute();
const user = useState('user')
const editMode = useState('editMode')
const galleryCount = computed(() => Math.max(image.value?.album?.images?.length ?? 1, 1))
const commentCount = computed(() => image.value?.comments?.length ?? 0)
const commentLabel = computed(() => `${commentCount.value} ${commentCount.value === 1 ? 'kommentar' : 'kommentarer'}`)
const fullScreen = ref(route.query.fullscreen === '1')
const commentsOpen = ref(route.query.comments !== '0')
const fullScreenCommentsOpen = ref(false)
const controlsVisible = ref(route.query.controls !== '0')
const mobileNavigationVisible = ref(false)
const normalSwipeFrame = ref<HTMLElement | null>(null)
const fullScreenSwipeFrame = ref<HTMLElement | null>(null)
const swipeOffsetX = ref(0)
const swipeAnimating = ref(false)
const swipeDragging = ref(false)
const suppressImageClick = ref(false)
let controlsTimer: ReturnType<typeof setTimeout> | null = null
let mobileNavigationTimer: ReturnType<typeof setTimeout> | null = null
let swipeNavigationTimer: ReturnType<typeof setTimeout> | null = null
let touchStartX = 0
let touchStartY = 0
let swipeFrameWidth = 0

const comment = ref<string>('');
const name = ref<string>(user.value?.firstName ?? '');
const commentSaved = ref<boolean>(false);
const error = ref<boolean>(false);

interface GalleryImage {
  id: number
  documentId: string
  title?: string
  url: string
  image?: {
    url?: string
  }
}

const imageTrackStyle = computed(() => {
  return {
    transform: `translateX(calc(-100% + ${swipeOffsetX.value}px))`
  }
})

const imageTrackClass = computed(() => {
  if (swipeDragging.value) return 'transition-none'
  if (swipeAnimating.value) return 'transition-transform duration-300 ease-out'

  return 'transition-transform duration-200 ease-out'
})

try {
  const {data} = await findOne('images', route.params.slug[0])
  image.value = data;
  const images = image.value.album?.images ?? [];
  const imageIndex = images.findIndex(img => img.id === image.value.id);
  currentImageIndex.value = imageIndex >= 0 ? imageIndex : 0;
  nextImage.value = images[currentImageIndex.value + 1] ?? null
  prevImage.value = images[currentImageIndex.value - 1] ?? null
} catch (e) {
  image.value = null;
}

const showFullScreenControls = () => {
  controlsVisible.value = true;

  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }

  if (fullScreen.value) {
    controlsTimer = setTimeout(() => {
      controlsVisible.value = false
    }, 1800)
  }
}

const showMobileNavigationControls = () => {
  mobileNavigationVisible.value = true;

  if (mobileNavigationTimer) {
    clearTimeout(mobileNavigationTimer)
  }

  mobileNavigationTimer = setTimeout(() => {
    mobileNavigationVisible.value = false
  }, 1800)
}

const hideMobileNavigationControls = () => {
  mobileNavigationVisible.value = false

  if (mobileNavigationTimer) {
    clearTimeout(mobileNavigationTimer)
    mobileNavigationTimer = null
  }
}

const suppressNextImageClick = () => {
  suppressImageClick.value = true

  setTimeout(() => {
    suppressImageClick.value = false
  }, 350)
}

const openFullScreenFromImage = () => {
  if (suppressImageClick.value) return;

  openFullScreen()
}

const showMobileNavigationControlsFromImage = () => {
  if (suppressImageClick.value) return;

  showMobileNavigationControls()
}

const shouldIgnoreSwipeStart = (target: EventTarget | null) => {
  return target instanceof HTMLElement && Boolean(target.closest('button, a, input, textarea, select'))
}

const startMouseSwipe = (event: MouseEvent) => {
  if (event.button !== 0 || shouldIgnoreSwipeStart(event.target)) return;

  swipeFrameWidth = event.currentTarget instanceof HTMLElement
    ? event.currentTarget.clientWidth
    : window.innerWidth
  touchStartX = event.clientX
  touchStartY = event.clientY
  swipeDragging.value = true
  swipeAnimating.value = false
  event.preventDefault()
}

const moveMouseSwipe = (event: MouseEvent) => {
  if (!swipeDragging.value) return;

  const deltaX = event.clientX - touchStartX
  const deltaY = event.clientY - touchStartY

  if (Math.abs(deltaX) > 3) {
    event.preventDefault()
  }

  moveImageSwipeOffset(deltaX, deltaY)
}

const finishMouseSwipe = (event: MouseEvent) => {
  if (!swipeDragging.value) return;

  finishImageSwipeOffset(event.clientX - touchStartX, event.clientY - touchStartY)
}

const cancelMouseSwipe = () => {
  if (!swipeDragging.value) return;

  finishImageSwipeOffset(swipeOffsetX.value, 0)
}

const startImageSwipe = (event: TouchEvent) => {
  const touch = event.changedTouches[0]
  if (!touch) return;

  swipeFrameWidth = event.currentTarget instanceof HTMLElement
    ? event.currentTarget.clientWidth
    : window.innerWidth
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  swipeDragging.value = true
  swipeAnimating.value = false
}

const moveImageSwipeOffset = (deltaX: number, deltaY: number) => {
  if (Math.abs(deltaY) > Math.abs(deltaX) * 1.4) {
    swipeOffsetX.value = 0
    return
  }

  swipeOffsetX.value = deltaX
}

const moveImageSwipe = (event: TouchEvent) => {
  if (!swipeDragging.value) return;

  const touch = event.changedTouches[0]
  if (!touch) return;

  moveImageSwipeOffset(touch.clientX - touchStartX, touch.clientY - touchStartY)
}

const finishImageSwipeOffset = (deltaX: number, deltaY: number) => {
  swipeDragging.value = false

  if (Math.abs(deltaX) > 10) {
    suppressNextImageClick()
  }

  if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
    swipeAnimating.value = true
    swipeOffsetX.value = 0
    return
  }

  hideMobileNavigationControls()
  swipeAnimating.value = true

  if (deltaX < 0) {
    if (!nextImage.value) {
      swipeOffsetX.value = 0
      return
    }

    swipeOffsetX.value = -(swipeFrameWidth || window.innerWidth)
    swipeNavigationTimer = setTimeout(() => {
      goToImage(nextImage.value, fullScreen.value)
    }, 300)
    return
  }

  if (!prevImage.value) {
    swipeOffsetX.value = 0
    return
  }

  swipeOffsetX.value = swipeFrameWidth || window.innerWidth
  swipeNavigationTimer = setTimeout(() => {
    goToImage(prevImage.value, fullScreen.value)
  }, 300)
}

const finishImageSwipe = (event: TouchEvent) => {
  if (!swipeDragging.value) return;

  const touch = event.changedTouches[0]
  if (!touch) return;

  finishImageSwipeOffset(touch.clientX - touchStartX, touch.clientY - touchStartY)
}

const currentSwipeFrameWidth = (keepFullScreen = fullScreen.value) => {
  const frame = keepFullScreen ? fullScreenSwipeFrame.value : normalSwipeFrame.value

  return frame?.clientWidth || swipeFrameWidth || window.innerWidth
}

const openFullScreen = () => {
  fullScreen.value = true;
  fullScreenCommentsOpen.value = false;
  swipeOffsetX.value = 0
  swipeDragging.value = false
  swipeAnimating.value = false
  hideMobileNavigationControls()
  showFullScreenControls()

  navigateTo({
    path: route.path,
    query: {
      fullscreen: '1'
    }
  }, { replace: true })
}

const goToImage = (target?: GalleryImage | null, keepFullScreen = false) => {
  if (!target?.url) return;

  navigateTo({
    path: `/image/${target.url}`,
    query: keepFullScreen
      ? {
          fullscreen: '1',
          controls: '0'
        }
      : {
          ...(!commentsOpen.value ? { comments: '0' } : {})
        }
  })
}

const animateToImage = (target?: GalleryImage | null, keepFullScreen = false) => {
  if (!target?.url) return;

  if (swipeNavigationTimer) {
    clearTimeout(swipeNavigationTimer)
    swipeNavigationTimer = null
  }

  hideMobileNavigationControls()
  swipeFrameWidth = currentSwipeFrameWidth(keepFullScreen)
  swipeDragging.value = false
  swipeAnimating.value = true
  swipeOffsetX.value = target.url === nextImage.value?.url
    ? -swipeFrameWidth
    : swipeFrameWidth

  swipeNavigationTimer = setTimeout(() => {
    goToImage(target, keepFullScreen)
  }, 300)
}

const closeFullScreen = () => {
  fullScreen.value = false;
  fullScreenCommentsOpen.value = false;
  controlsVisible.value = true;
  swipeOffsetX.value = 0
  swipeDragging.value = false
  swipeAnimating.value = false
  hideMobileNavigationControls()

  if (controlsTimer) {
    clearTimeout(controlsTimer)
    controlsTimer = null
  }

  navigateTo({
    path: route.path,
    query: !commentsOpen.value ? { comments: '0' } : {}
  }, { replace: true })
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

const handleKeydown = (event: KeyboardEvent) => {
  if (isTypingTarget(event.target)) return;

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    animateToImage(prevImage.value, fullScreen.value)
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    animateToImage(nextImage.value, fullScreen.value)
  }

  if (event.key === 'Escape' && fullScreen.value) {
    event.preventDefault()
    closeFullScreen()
  }
}

watch(fullScreen, (isFullScreen) => {
  if (isFullScreen) {
    if (route.query.controls === '0') {
      controlsVisible.value = false
      return
    }

    showFullScreenControls()
    return
  }

  controlsVisible.value = true
  if (controlsTimer) {
    clearTimeout(controlsTimer)
    controlsTimer = null
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (fullScreen.value) {
    if (route.query.controls === '0') {
      controlsVisible.value = false
    } else {
      showFullScreenControls()
    }
  }

})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
  if (mobileNavigationTimer) {
    clearTimeout(mobileNavigationTimer)
  }
  if (swipeNavigationTimer) {
    clearTimeout(swipeNavigationTimer)
  }
})

const postComment = async () => {
  try {
    const {data} = await create('comments', {
          comment: comment.value,
          name: name.value,
          image: image.value.id,
          user: user.value?.documentId
    })
    commentSaved.value = true;
    image.value.comments.push(data);
  } catch (e) {
    error.value = true;
  }
}

const setCoverImage = async () => {
  try {
    await update<ApiAlbumAlbum>('albums', image.value.album.documentId, {
      cover: image.value.documentId
    })
    image.value.album.cover.documentId = image.value.documentId;
  } catch (e) {
  }
}
</script>
