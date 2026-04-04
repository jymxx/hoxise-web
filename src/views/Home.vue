<template>
  <div class="movie-manager">
    <MovieIndex />
    <div class="icp-info">
      <p>ICP备案/许可证号：蜀ICP备2025179642号 | 川公网安备51010702043884号</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserInfo } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'
import { useUIStore } from '@/store/modules/ui'
import MovieIndex from '@/views/movie/MovieIndex.vue'

const userStore = useUserStore()
const uiStore = useUIStore()
// 加载用户信息
const loadUserInfo = async () => {
  try {
    const result = await getUserInfo()
    // 转换后端 VO 为前端 Store 格式
    userStore.setUserInfo({
      userId: String(result.userId),
      userName: result.userName,
      nickName: result.nickName,
      roles: result.roles,
      avatar: result.avatar,
    })
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

onMounted(() => {
  loadUserInfo() // 加载用户信息
  uiStore.loadSettings() // 加载设置
})
</script>

<style scoped lang="scss">
.movie-manager {
  background-color: #000000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.icp-info {
  text-align: center;
  padding: 20px;
  color: #ffffff;
  font-size: 14px;
  margin-top: auto;
}
</style>
