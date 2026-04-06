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

      <!-- 收藏 -->
      <MovieFavorite
        v-else-if="activeTab === TabType.FAVORITE"
        :key="'favorite'"
        @go-detail="handleGoDetail"
        @go-all-library="handleMenuSelected('library')" />

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

    <!-- 影视详情遮罩层 -->
    <div class="detail-overlay" v-if="showDetail">
      <MovieDetail
        :catalogid="currentDetailParams?.catalogId"
        :bangumi-id="currentDetailParams?.bangumiId"
        @go-back="handleGoBack"
        @show-matching="handleShowMatching" />
    </div>

    <!-- 灵动岛？ 雾 -->
    <SuspendIsland title="提示：正在浏览他人数据" gradient-text class="island-custom" v-if="enableSuspendIsland">
      <div class="my-3 flex flex-col gap-2">
        <a href="/"># 返回首页</a>
        <a v-if="!useUser.isLogin" @click.prevent="handleLogin" class="login-link"># 登录 </a>
      </div>
    </SuspendIsland>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MovieTabs from './sidebar/MovieTabs.vue'
import MovieHome from './content/MovieHome.vue'
import MovieLibrary from './content/MovieLibrary.vue'
import MovieFavorite from './content/MovieFavorite.vue'
import MovieDetail from './content/MovieDetail.vue'
import SmsLoginDialog from '@/views/system/components/SmsLoginDialog.vue'
import SuspendIsland from '@/components/inspira-ui/miscellaneous/SuspendIsland.vue'
import { getTargetUserid } from '@/utils/route'
import { useUserStore } from '@/store/modules/user'
import { useUIStore } from '@/store/modules/ui'
import { ElMessage } from 'element-plus'

const useUser = useUserStore()
const useUi = useUIStore()

// 显示浮动岛
const enableSuspendIsland = computed(() => {
  // 是否浏览他人数据 或 在收藏页
  return getTargetUserid() !== useUser.id && activeTab.value !== TabType.FAVORITE
})

// 标签页枚举
enum TabType {
  HOME = 'home', // 首页
  FAVORITE = 'favorite', // 收藏
  LIBRARY = 'library', // 影视库
}

// 当前激活的标签
const activeTab = ref(TabType.HOME)

// 当前目录 (过滤参数)
const currentDirectory = ref('')

// 当前详情参数
const currentDetailParams = ref<{ catalogId: string | number; bangumiId?: string | number } | undefined>(undefined)

// 是否显示详情
const showDetail = ref(false)

// 菜单选择处理
const handleMenuSelected = (key: string) => {
  switch (key) {
    case 'home': // 首页
      activeTab.value = TabType.HOME
      break
    case 'favorite': // 收藏
      activeTab.value = TabType.FAVORITE
      break
    case 'library': // 影视库
      activeTab.value = TabType.LIBRARY
      currentDirectory.value = ''
      break
    default:
      activeTab.value = TabType.LIBRARY
      currentDirectory.value = key
  }
}

// 跳转详情
const handleGoDetail = (params: { catalogId: number; bangumiId?: number }) => {
  if (!params.bangumiId || !params.catalogId) {
    ElMessage.error('参数错误，无法打开详情页面')
    return
  }
  currentDetailParams.value = params
  showDetail.value = true // 打开详情
}

// 返回处理
const handleGoBack = () => {
  showDetail.value = false // 关闭详情
  currentDetailParams.value = undefined // 清空详情参数
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

/* 详情遮罩层 - 覆盖在主内容上方 */
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
