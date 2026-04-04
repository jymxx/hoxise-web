<template>
  <div class="user-info-dropdown ">
    <el-dropdown trigger="click" popper-class="user-dropdown-popper">
      <div class="user-info">
        <!-- 用户头像 -->
        <el-avatar :src="avatarUrl" :size="36" shape="circle" class="user-avatar" />
        <!-- 用户昵称 -->
        <span class="user-nickName">{{ userStore.nickName }}</span>
        <!-- 下拉箭头 -->
        <el-icon class="arrow-icon"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-menu class="dropdown-menu">
          <el-menu-item index="profile" @click="router.push('/profile')">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>

          <!-- 设置菜单 -->
          <el-sub-menu index="settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </template>
            <el-menu-item v-for="item in SETTINGS_CONFIG" :key="item.key" :index="item.key">
              <span>{{ item.label }}</span>
              <el-switch
                :model-value="getSettingValue(item.key)"
                size="small"
                @update:model-value="toggleSetting(item.key, $event)" />
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="logout" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </template>
    </el-dropdown>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { logout } from '@/api/system/auth'
import { removeToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useUIStore, type UserSettings } from '@/store/modules/ui'
import { useRouter } from 'vue-router'

// ========== Store & Router ==========
const userStore = useUserStore()
const uiStore = useUIStore()
const router = useRouter()

// ========== 计算属性 ==========
const avatarUrl = computed(() => userStore.avatar || '')

// 设置配置项
const SETTINGS_CONFIG = [
  { key: 'enableBgEffect' as keyof UserSettings, label: '飘落特效' },
  { key: 'enableClickEffect' as keyof UserSettings, label: '点击特效' },
  { key: 'enableSleekLineCursor' as keyof UserSettings, label: '鼠标轨迹' },
]

// 获取设置的初始值
const getSettingValue = (key: keyof UserSettings) => uiStore.settings[key]

// 切换设置
const toggleSetting = (key: keyof UserSettings, value: boolean | string) => {
  uiStore.updateSetting(key, value)
}

// ========== 方法 ==========
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await logout()
    removeToken()
    userStore.reset()
    location.reload()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
/* ========== 用户信息下拉容器 ========== */
.user-info-dropdown {
  position: relative;
  background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%);
  border-radius: 12px;
  padding: 4px;
  overflow: hidden; /* 防止流星雨撑大容器 */

  /* 用户信息区域 - 头像 + 昵称 + 箭头 */
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
    padding: 6px 12px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(26, 188, 156, 0.1),
        transparent
      );
      transition: left 0.5s ease;
    }

    &:hover {
      background-color: rgba(26, 188, 156, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(26, 188, 156, 0.2);

      &::before {
        left: 100%;
      }
    }

    /* 用户头像 */
    .user-avatar {
      margin-right: 10px;
      border: 1px solid rgba(26, 188, 156, 0.5);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(26, 188, 156, 0.3);

      &:hover {
        border-color: rgba(26, 188, 156, 0.8);
        transform: scale(1.05);
        box-shadow: 0 4px 16px rgba(26, 188, 156, 0.5);
      }
    }

    /* 用户昵称 */
    .user-nickName {
      font-size: 17px;
      background: linear-gradient(135deg, #ecf0f1 0%, #1abc9c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: all 0.3s ease;
    }

    /* 下拉箭头图标 */
    .arrow-icon {
      margin-left: 6px;
      font-size: 14px;
      color: #1abc9c;
      transition: transform 0.3s ease;
    }
  }

  &:hover .arrow-icon {
    transform: rotate(180deg);
  }
}

/* ========== 下拉菜单样式 ========== */
.dropdown-menu {
  border: none;
  width: 180px;
  background: linear-gradient(135deg, rgba(26, 37, 47, 0.98) 0%, rgba(44, 62, 80, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(26, 188, 156, 0.1);
  animation: menuSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  .el-menu-item,
  :deep(.el-sub-menu__title) {
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 44px;
    display: flex;
    align-items: center;

    .el-icon {
      color: #1abc9c;
      transition: all 0.3s ease;
      font-size: 18px;
    }

    span {
      color: #ecf0f1;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(26, 188, 156, 0.15) 0%, rgba(26, 188, 156, 0.05) 100%);
      transform: translateX(4px);

      .el-icon {
        color: #48dbfb;
        transform: scale(1.1);
      }
    }

    &.is-active {
      background: rgba(26, 188, 156, 0.2);

      .el-icon {
        color: #48dbfb;
      }
    }
  }

  /* 子菜单样式 */
  :deep(.el-sub-menu) {
    .el-menu {
      background: transparent;
      border-radius: 8px;
      padding-left: 8px;

      .el-menu-item {
        min-height: 40px;
        padding-left: 44px;

        &:hover {
          background: rgba(26, 188, 156, 0.1);
        }
      }
    }
  }


}

/* 开关样式 */
.el-switch {
  margin-left: 10px;
  --el-switch-on-color: #1abc9c;
  --el-switch-off-color: #34495e;
}

/* 菜单下滑动画 */
@keyframes menuSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

</style>
