<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/store/modules/ui'

const uiStore = useUIStore()

onMounted(() => {
  uiStore.loadSettings()
})
</script>

<style lang="scss">
/* 根容器样式 */
#app {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased; /* iOS 字体平滑 */
  -moz-osx-font-smoothing: grayscale; /* Firefox 字体平滑 */
  color: #2c3e50;
  height: 100vh; /* 占满整个视口高度 */
  overflow: hidden; /* 防止出现双重滚动条 */
}
</style>
