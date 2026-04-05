<template>
  <!-- 禁用浏览器右键信息 -->
  <div class="movie-index">
    <!-- 侧边栏 -->
    <div class="main-sidebar">
      <MovieTabs @menu-selected="handleMenuSelected" />
    </div>

    <!-- 主内容区域 -->
    <Transition name="fade" mode="out-in" class="main-content">
      <!-- 首页 -->
      <MovieHome
        v-if="activeTab === TabType.HOME"
        :key="'home'"
        @go-detail="handleGoDetail"
        @go-allMovie="handleGoAllMovie" />

      <!-- 影视库 -->
      <MovieLibrary
        v-else
        :key="'library-' + currentDirectory"
        :directory="currentDirectory"
        @go-detail="handleGoDetail"
        @show-matching="handleShowMatching" />
    </Transition>

    <!-- 登录弹窗 -->
    <SmsLoginDialog />

    <!-- 滚动岛 -->
    <SuspendIsland title="提示：正在浏览他人数据" class="island-custom" v-if="seeOtherData">
      <div class="my-3 flex flex-col gap-2">
        <a href="/"># 返回首页</a>
        <a v-if="!useUser.isLogin" @click.prevent="handleLogin" class="login-link"># 登录 </a>
      </div>
    </SuspendIsland>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MovieTabs from './sidebar/MovieTabs.vue'
import MovieHome from './content/MovieHome.vue'
import MovieLibrary from './content/MovieLibrary.vue'
import SmsLoginDialog from '@/views/system/components/SmsLoginDialog.vue'
import SuspendIsland from '@/components/inspira-ui/miscellaneous/SuspendIsland.vue'
import { getTargetUserid } from '@/utils/route'
import { useUserStore } from '@/store/modules/user'
import { useUIStore } from '@/store/modules/ui'

const useUser = useUserStore()
const useUi = useUIStore()
// 是否浏览他人数据
const seeOtherData = computed(() => {
  return getTargetUserid() !== useUser.id
})

// 标签页枚举
enum TabType {
  HOME = 'home', // 首页
  LIBRARY = 'library', // 影视库
}

// 当前激活的标签
const activeTab = ref(TabType.HOME)

// 当前目录 (过滤参数)
const currentDirectory = ref('')

// 菜单选择处理
const handleMenuSelected = (key: string) => {
  switch (key) {
    case 'home':
      activeTab.value = TabType.HOME
      currentDirectory.value = ''
      break
    case 'history':
    case 'library':
      activeTab.value = TabType.LIBRARY
      currentDirectory.value = ''
      break
    default:
      activeTab.value = TabType.LIBRARY
      currentDirectory.value = key
  }
}

// 跳转详情
const handleGoDetail = (id: number) => {
  console.log('go detail:', id)
  // TODO: 跳转详情
}

// 显示全部影视
const handleGoAllMovie = (key: string) => {
  handleMenuSelected(key)
}

// 显示匹配对话框
const handleShowMatching = (movie: { id: string | number; name: string }) => {
  console.log('show matching:', movie)
  // TODO: 显示匹配对话框
}

// 打开登录弹窗
const handleLogin = () => {
  useUi.openLoginDialog()
}
</script>

<style scoped lang="scss">
.movie-index {
  display: flex;
  height: 100vh;
  background-color: #0a0a0a;
  .main-sidebar {
    width: 220px;
    z-index: 3;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    width: 2500px;
    z-index: 3;
  }
}

// 覆盖 SuspendIsland 文本颜色
:deep(.island-custom #motion-id) {
  color: transparent;
  background-image: linear-gradient(to right, #fbbf24, #f97316, #ef4444);
  -webkit-background-clip: text;
  background-clip: text;
}

// 覆盖超链接颜色
:deep(.island-custom a) {
  color: #60a5fa !important;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
