<template>
  <MovieDetail
    v-if="resolved"
    :key="catalogId"
    :catalog-id="catalogId"
    :bangumi-id="bangumiId"
    @go-back="handleGoBack"
    @show-matching="handleShowMatching" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MovieDetail from './content/MovieDetail.vue'
import { detail as getCatalogDetail } from '@/api/movie/movieCatalog'
import { decodeId } from '@/utils/sqids.ts'

const route = useRoute()
const router = useRouter()

const rawCode = String(route.params.catalogId)
const catalogId = decodeId(rawCode)
const bangumiId = ref<string | undefined>(undefined)
const resolved = ref(false)

// 初始化
onMounted(async () => {
  try {
    const res = await getCatalogDetail(catalogId)
    bangumiId.value = String(res.bangumiId)
    resolved.value = true
  } catch (e) {
    router.push('/error')
  }
})

const handleGoBack = () => {
  router.push('/')
}

const handleShowMatching = () => {
  ElMessage.info('匹配功能需在完整页面中使用')
}
</script>

<style scoped>
.page-loading,
.page-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #aaa;
  gap: 16px;
  background: linear-gradient(135deg, #0f0f1a 0%, #232335 50%, #0f0f1a 100%);
}

.loading-text {
  font-size: 24px;
  letter-spacing: 4px;
}
</style>
