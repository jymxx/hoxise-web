<template>
  <div class="user-info-dropdown">
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

          <!-- 设置菜单 - 使用 el-dropdown 实现向右展开 -->
          <el-menu-item index="settings">
            <el-dropdown trigger="hover" placement="right-start" :hide-on-click="false">
              <div class="settings-menu-title">
                <el-icon><Setting /></el-icon>
                <span>设置</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="settings-dropdown-menu">
                  <template v-for="item in SETTINGS_CONFIG" :key="item.key">
                    <!-- 父级设置项 -->
                    <el-dropdown-item v-if="!item.children" :index="item.key">
                      <span>{{ item.label }}</span>
                      <el-switch
                        :model-value="getSettingValue(item.key)"
                        size="small"
                        style="margin-left: auto"
                        @update:model-value="toggleSetting(item.key, $event)" />
                    </el-dropdown-item>
                    <!-- 子菜单 - 嵌套 dropdown -->
                    <el-dropdown v-else trigger="hover" placement="right-start" :hide-on-click="false">
                      <el-dropdown-item :index="item.key">
                        <span>{{ item.label }}</span>
                      </el-dropdown-item>
                      <template #dropdown>
                        <el-dropdown-menu class="settings-dropdown-menu">
                          <el-dropdown-item v-for="child in item.children" :key="child.key" :index="child.key">
                            <span>{{ child.label }}</span>
                            <el-switch
                              :model-value="getSettingValue(child.key)"
                              size="small"
                              style="margin-left: auto"
                              @update:model-value="toggleSetting(child.key, $event)" />
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-menu-item>

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
  { key: 'enableBgEffect' as keyof UserSettings, label: '背景特效' },
  {
    key: 'cursorTails',
    label: '鼠标轨迹',
    children: [
      { key: 'enableSleekLineCursor' as keyof UserSettings, label: '流线' },
      { key: 'enableFluidCursor' as keyof UserSettings, label: '流体' },
    ],
  },
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
    ElMessage.success('退出登录成功')
    setTimeout(() => {
      location.reload()
    }, 500)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
/* ========== 用户信息下拉容器 ========== */
.user-info-dropdown {
  background-color: #1a252f;

  /* 用户信息区域 - 头像 + 昵称 + 箭头 */
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    padding: 4px 8px;

    &:hover {
      background-color: rgba(26, 188, 156, 0.1);
    }

    /* 用户头像 */
    .user-avatar {
      margin-right: 10px;
      border: 1px solid rgba(146, 219, 253, 0.3);
    }

    /* 用户昵称 */
    .user-nickName {
      font-size: 18px;
      color: #ecf0f1;
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* 下拉箭头图标 */
    .arrow-icon {
      margin-left: 6px;
      font-size: 12px;
      color: #999;
    }
  }
}

/* ========== 下拉菜单样式 ========== */
.dropdown-menu {
  background: transparent;
  border: none;
  // width: 180px;

  /* 菜单项样式 */
  :deep(.el-menu-item) {
    height: 40px;
    line-height: 40px;
    color: #606266;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  /* 子菜单标题样式 */
  :deep(.el-sub-menu__title) {
    height: 40px;
    line-height: 40px;
    color: #606266;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* ========== Popper 弹出层样式 ========== */
.user-dropdown-popper {
  /* 子菜单标题内的图标间距 */
  .el-sub-menu__title .el-icon {
    margin-right: 5px;
  }

  /* 菜单项内的图标间距 */
  .el-menu-item .el-icon {
    margin-right: 5px;
  }

  /* 菜单项内容布局 */
  .el-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* switch 右侧间距 */
  .el-switch {
    margin-left: auto;
  }
}

/* ========== 设置菜单标题样式 ========== */
.settings-menu-title {
  display: flex;
  align-items: center;
  height: 40px;

  .el-icon {
    margin-right: 5px;
  }
}

/* ========== 设置下拉菜单样式 ========== */
.settings-dropdown-menu {
  /* 下拉项内容布局 */
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  /* switch 右侧间距 */
  .el-switch {
    margin-left: auto;
  }
}
</style>
