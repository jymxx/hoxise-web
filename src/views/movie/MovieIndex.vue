<template>
  <!-- 禁用浏览器右键信息 -->
  <div class="movie-index" @contextmenu.prevent>
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

    <!-- 点击界面出现烟花效果 -->
    <Hanabi class="firework" />

    <!-- 鼠标拖尾 -> 流线光标 (根据设置控制显示) -->
    <SleekLineCursor v-if="enableSleekLineCursor" />

    <!-- 鼠标拖尾 ->流体光标 (根据设置控制显示) -->
    <FluidCursor v-if="enableFluidCursor" />

    <!-- 星空背景 -->
    <StarsBg class="background-star" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MovieTabs from './sidebar/MovieTabs.vue'
import MovieHome from './content/MovieHome.vue'
import MovieLibrary from './content/MovieLibrary.vue'
import SmsLoginDialog from '@/views/system/components/SmsLoginDialog.vue'
import Hanabi from '@/components/Hanabi.vue'
import SleekLineCursor from '@/components/inspira-ui/cursor/SleekLineCursor.vue'
import FluidCursor from '@/components/inspira-ui/cursor/FluidCursor.vue'
import { useUIStore } from '@/store/modules/ui'
import StarsBg from '@/components/inspira-ui/backgrounds/StarsBg.vue'

const uiStore = useUIStore()

// 从 store 获取设置状态
const enableSleekLineCursor = computed(() => uiStore.getSetting('enableSleekLineCursor'))
const enableFluidCursor = computed(() => uiStore.getSetting('enableFluidCursor'))

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
    case 'library':
    case 'history':
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
</script>

<style scoped lang="scss">
.movie-index {
  display: flex;
  height: 100vh;
  background-color: #0a0a0a;

  .main-sidebar {
    width: 220px;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    width: 2500px;
  }
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

// 背景
.background-star {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
