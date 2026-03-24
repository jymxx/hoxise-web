<template>
  <div class="user-info-dropdown">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="user-info">
        <el-avatar
          :src="userAvatar"
          :size="36"
          class="user-avatar"
        >
          <i class="el-icon-user-solid"></i>
        </el-avatar>
        <span class="user-name">{{ userName }}</span>
        <i class="el-icon-arrow-down"></i>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="profile">
          <i class="el-icon-user"></i> 个人中心
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <i class="el-icon-setting"></i> 设置
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <i class="el-icon-switch-button"></i> 退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { logout } from '@/api/system/auth'
import { removeToken } from '@/utils/auth'
import store from '@/store'

export default {
  name: 'UserInfoDropdown',
  data() {
    return {
      userName: '未登录',
      userAvatar: ''
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      this.userName = store.getters.name
    },
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$message.info('个人中心功能开发中...')
          break
        case 'settings':
          this.$message.info('设置功能开发中...')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    async handleLogout() {
      this.$confirm('确认退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await logout()
          this.$message.success('退出登录成功')
          // 清除本地 token
          removeToken();
          // 刷新页面
          setTimeout(() => {
            location.reload()
          }, 500)
        } catch (error) {
          console.error('退出登录失败:', error)
          this.$message.error('退出登录失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.user-info-dropdown {
  background-color: #1a252f;

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;

    &:hover {
      background-color: rgba(26, 188, 156, 0.1);
    }

    .user-avatar {
      margin-right: 10px;
    }

    .user-name {
      font-size: 17px;
      color: #ecf0f1;
      font-weight: 500;
    }

    .el-icon-arrow-down {
      margin-left: auto;
      font-size: 12px;
      color: #999;
    }
  }

  ::v-deep .el-dropdown-menu__item {
    display: flex;
    align-items: center;

    i {
      margin-right: 8px;
    }

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
