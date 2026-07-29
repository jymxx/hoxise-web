<template>
  <div class="movie-card featured-card">
    <CardContainer>
      <CardBody
        class="group/card relative h-auto w-fit rounded-xl border border-black/10 bg-gray-50 p-6 sm:w-120 dark:border-white/20 dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/10"
      >
        <CardItem
          :translate-x="image.translateX"
          :translate-y="image.translateY"
          :translate-z="image.translateZ"
          :rotate-x="image.rotateX"
          :rotate-y="image.rotateY"
          :rotate-z="image.rotateZ"
          class="mt-4 w-full"
        >
          <img
            :src="src"
            :height="height"
            :width="width"
            class="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
            :alt="alt"
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  </div>
</template>

<script setup lang="ts">
import CardContainer from '@/components/inspira-ui/cards/3D/CardContainer.vue'
import CardBody from '@/components/inspira-ui/cards/3D/CardBody.vue'
import CardItem from '@/components/inspira-ui/cards/3D/CardItem.vue'

interface TransformProps {
  translateX?: number
  translateY?: number
  translateZ?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
}

interface Props {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  image?: TransformProps
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'thumbnail',
  width: 1000,
  height: 1000,
  image: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 100,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
})
</script>

<style scoped lang="scss">
.movie-card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}
</style>
