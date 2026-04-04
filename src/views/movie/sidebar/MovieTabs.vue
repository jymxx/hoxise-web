<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 v-if="!isLogin" class="logo-text" @click="handleClickLogo">风间</h2>
      <UserInfoDropdown v-if="isLogin" />
    </div>

    <div class="movie-tabs">
      <el-menu
        :default-openeds="['library']"
        :default-active="defaultActive"
        class="sidebar-menu"
        :background-color="'#2c3e50'"
        :text-color="'#fff'"
        :active-text-color="'#1abc9c'"
        @select="handleSelect">
        <!-- 一级菜单 -->
        <el-menu-item v-for="item in simpleMenuItems" :key="item.key" :index="item.key">
          <el-icon :size="18"><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>

        <!-- 子级菜单 -->
        <el-sub-menu v-for="subMenu in libraryMenus" :key="subMenu.key" :index="subMenu.key">
          <template #title>
            <el-icon :size="18"><component :is="subMenu.icon" /></el-icon>
            <span>{{ subMenu.name }}</span>
            <span class="menu-count">{{ subMenu.count }}</span>
          </template>
          <el-menu-item v-for="child in subMenu.children" :key="child.key" :index="child.key">
            <el-icon :size="18"><component :is="child.icon" /></el-icon>
            {{ child.name }}
            <span class="menu-count">{{ child.count }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, markRaw } from 'vue'
import { Menu, Film, VideoPlay, Grid, Star, VideoCamera, Monitor } from '@element-plus/icons-vue'
import { movieStat } from '@/api/movie/movieCatalog'
import UserInfoDropdown from '@/views/system/components/UserInfoDropdown.vue'
import { useUserStore } from '@/store/modules/user'
import { useLogin } from '@/composables/useLogin'
import { getTargetUserid } from '@/utils/route'

// Emits
const emit = defineEmits<{
  'menu-selected': [key: string]
}>()

// Store
const userStore = useUserStore()
const { open: openLogin } = useLogin()

// 登录状态（计算属性）
const isLogin = computed(() => userStore.isLogin)

// 菜单数据
const defaultActive = ref('home')
const simpleMenuItems = [
  { key: 'home', name: '首页', icon: markRaw(Menu) },
  { key: 'history', name: '收藏记录', icon: markRaw(Film) },
]
const libraryMenus = ref([
  {
    key: 'library',
    name: '影视库',
    icon: markRaw(VideoPlay),
    count: '',
    children: [
      { key: 'library', name: '全部', icon: markRaw(Grid), count: '' },
      { key: 'anime', name: '动漫', icon: markRaw(Star), count: '' },
      { key: 'animeMovie', name: '动漫电影', icon: markRaw(VideoCamera), count: '' },
      { key: 'other', name: '其它', icon: markRaw(Monitor), count: '' },
    ],
  },
])

// 加载统计数据
const loadStats = async () => {
  const data = await movieStat(getTargetUserid())
  libraryMenus.value[0].children.forEach((child) => {
    switch (child.key) {
      case 'anime':
        child.count = data?.totalAnime || ''
        break
      case 'animeMovie':
        child.count = data?.totalAnimeMovie || ''
        break
      case 'other':
        child.count = data?.totalOther || ''
        break
      case 'library':
        child.count = data?.totalCount || ''
        break
    }
  })
}

// 菜单选择
const handleSelect = (index: string) => {
  emit('menu-selected', index)
}

// 点击 Logo
const handleClickLogo = () => {
  openLogin()
}

// 初始化
onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
/* ========== 侧边栏容器 ========== */
.sidebar {
  width: 220px;
  background-color: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  overflow-y: auto;

  /* 侧边栏头部 - Logo 区域 */
  .sidebar-header {
    padding: 20px;
    background-color: #1a252f;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    /* Logo 文字 */
    .logo-text {
      cursor: pointer;
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #ecf0f1;
      text-shadow:
        2px 2px 4px rgba(0, 0, 0, 0.5),
        0 0 10px rgba(26, 188, 156, 0.3);
      font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
      letter-spacing: 2px;
      transition: all 0.3s ease;

      &:hover {
        color: #1abc9c;
        text-shadow:
          2px 2px 4px rgba(0, 0, 0, 0.5),
          0 0 15px rgba(26, 188, 156, 0.6);
        transform: scale(1.05);
      }
    }
  }
}

/* ========== 菜单区域 ========== */
.sidebar-menu {
  text-align: left;

  /* 菜单项和子菜单标题 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    display: flex;
    align-items: center;

    /* 数量标签 */
    .menu-count {
      margin-left: auto;
      color: white;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 12px;
      line-height: 1;
    }
  }

  /* 子菜单标题的数量标签 */
  :deep(.el-sub-menu__title) {
    .menu-count {
      margin-right: 20px;
    }
  }
}
</style>
