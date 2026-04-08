<template>
  <div id="app" @contextmenu.prevent>
    <router-view />

    <!-- 鼠标点击 -> 粒子特效 -->
    <Hanabi v-if="enableClickEffect" />

    <!-- 鼠标拖尾 -> 流线光标 -->
    <SleekLineCursor v-if="enableSleekLineCursor" />

    <!-- 樱花效果 -->
    <Sakura v-if="enableBgEffect" />

    <!-- 星空背景 -->
    <StarsBg star-color="#fff" class="stars-bg" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getUserInfo } from '@/api/system/user'
import { validate } from '@/api/system/access'
import { useUserStore } from '@/store/modules/user'
import { useUIStore } from '@/store/modules/ui'
// 特效组件
import Hanabi from '@/components/effects/Hanabi.vue'
import SleekLineCursor from '@/components/inspira-ui/cursor/SleekLineCursor.vue'
import Sakura from '@/components/effects/Sakura.vue'
import StarsBg from '@/components/inspira-ui/backgrounds/StarsBg.vue'
import { ElMessage } from 'element-plus'

const uiStore = useUIStore()
const userStore = useUserStore()

// 从 store 获取设置状态
const enableClickEffect = computed(() => uiStore.getSetting('enableClickEffect'))
const enableSleekLineCursor = computed(() => uiStore.getSetting('enableSleekLineCursor'))
const enableBgEffect = computed(() => uiStore.getSetting('enableBgEffect'))

// 验证服务状态
const checkServerStatus = async () => {
  try {
    await validate()
  } catch (error) {
    ElMessage.error(error || '服务器连接失败！！')
  }
}

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
  } catch (error) {}
}

onMounted(async () => {
  await Promise.all([
    checkServerStatus(), // 验证服务状态
    loadUserInfo(), // 加载用户信息
    uiStore.loadSettings(), // 加载设置
  ])
  uiStore.markInitialized() // 标记初始化完成
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

// 星空背景
.stars-bg {
  position: fixed;
  inset: 0;
  z-index: 0; // 确保在根容器上 在内容下
}
</style>
