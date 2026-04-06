<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-wrapper" @click="handleClickLogo">
        <h2 v-if="!isLogin" class="logo-text">风间</h2>
        <span v-if="!isLogin" class="login-tip">点击登录</span>
      </div>
      <UserInfoDropdown v-if="isLogin" />
      <!-- 流星雨 -->
      <Meteors :count="30" />
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
import { useUIStore } from '@/store/modules/ui'
import { getTargetUserid } from '@/utils/route'
import Meteors from '@/components/inspira-ui/special-effects/Meteors.vue'

// Emits
const emit = defineEmits<{
  'menu-selected': [key: string]
}>()

// Store
const userStore = useUserStore()
const uiStore = useUIStore()

// 登录状态（计算属性）
const isLogin = computed(() => userStore.isLogin)

// 菜单数据
const defaultActive = ref('home')
const simpleMenuItems = [
  { key: 'home', name: '首页', icon: markRaw(Menu) },
  { key: 'favorite', name: '收藏记录', icon: markRaw(Film) },
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
  uiStore.openLoginDialog()
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
    position: relative;
    overflow: hidden;

    .logo-wrapper {
      position: relative;
      cursor: pointer;
      text-align: center;

      .logo-text {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
        color: #ecf0f1;
        text-shadow:
          2px 2px 4px rgba(0, 0, 0, 0.5),
          0 0 10px rgba(26, 188, 156, 0.3);
        font-family: 'Noto Serif SC', 'Source Han Serif CN', 'Songti SC', 'SimSun', serif;
        letter-spacing: 8px;
        transition: all 0.3s ease;
        font-style: italic;
      }

      /* 登录提示文字 */
      .login-tip {
        display: block;
        font-size: 12px;
        color: rgba(26, 188, 156, 0.7);
        margin-top: 6px;
        letter-spacing: 4px;
        opacity: 0.8;
        transition: all 0.3s ease;
      }

      &:hover {
        .logo-text {
          color: #1abc9c;
          text-shadow:
            2px 2px 4px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(26, 188, 156, 0.8);
          transform: scale(1.05);
        }

        .login-tip {
          color: #1abc9c;
          opacity: 1;
          letter-spacing: 6px;
        }
      }
    }
  }
}

/* ========== 菜单区域 ========== */
.sidebar-menu {
  text-align: left;
  border-right: none;

  /* 菜单项和子菜单标题 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    display: flex;
    align-items: center;
    height: 50px;
    margin: 4px 8px;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    /* 数量标签 */
    .menu-count {
      margin-left: auto;
      color: #94a3b8;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      line-height: 1;
      background-color: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    /* hover 效果 */
    &:hover {
      background-color: rgba(26, 188, 156, 0.1);

      .menu-count {
        background-color: rgba(26, 188, 156, 0.2);
        color: #1abc9c;
      }
    }

    /* 选中状态 */
    &.is-active {
      background: linear-gradient(135deg, rgba(26, 188, 156, 0.2), rgba(26, 188, 156, 0.1));
      box-shadow: 0 2px 12px rgba(26, 188, 156, 0.15);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: linear-gradient(180deg, #1abc9c, #148f74);
        border-radius: 0 4px 4px 0;
      }

      .menu-count {
        background-color: #1abc9c;
        color: white;
      }
    }
  }

  /* 子菜单 */
  :deep(.el-sub-menu) {
    margin-bottom: 2px;

    &.is-opened > .el-sub-menu__title {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  /* 子菜单标题的数量标签 */
  :deep(.el-sub-menu__title) {
    .menu-count {
      margin-right: 20px;
    }
  }

  /* 子菜单项 */
  :deep(.el-menu--inline .el-menu-item) {
    height: 44px;
    margin: 2px 0;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    margin-left: 12px;
    margin-right: 12px;
    width: calc(100% - 24px);

    &:hover {
      background-color: rgba(26, 188, 156, 0.15);
    }

    &.is-active {
      background-color: rgba(26, 188, 156, 0.25);
    }
  }

  /* 展开动画 */
  :deep(.el-menu--inline) {
    overflow: hidden;
    animation: slideDown 0.3s ease;
  }
}

/* 展开动画 keyframes */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
