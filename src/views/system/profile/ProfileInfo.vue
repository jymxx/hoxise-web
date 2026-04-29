<template>
  <!-- 用户信息区域 -->
  <div class="info-section">
    <div class="section-header">
      <h3 class="section-title">
        <el-icon class="section-icon"><UserFilled /></el-icon>
        基本信息
      </h3>
      <div class="header-actions">
        <template v-if="!editing">
          <el-button class="edit-btn" type="primary" size="small" @click="startEditing">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </template>
        <template v-else>
          <el-button class="action-btn" size="small" @click="cancelEditing">取消</el-button>
          <el-button
            class="action-btn confirm-btn"
            type="primary"
            size="small"
            :loading="submitting"
            @click="handleSubmit">
            <el-icon><Check /></el-icon>
            确认保存
          </el-button>
        </template>
      </div>
    </div>

    <div class="info-cards">
      <!-- 昵称卡片 -->
      <div class="info-card">
        <div class="info-label">
          <el-icon class="label-icon"><Star /></el-icon>
          昵称
        </div>
        <div class="info-value">
          <template v-if="!editing">
            {{ userInfo.nickName }}
          </template>
          <template v-else>
            <el-input
              v-model="editForm.nickName"
              maxlength="20"
              placeholder="请输入昵称"
              class="edit-input"
              clearable />
          </template>
        </div>
      </div>

      <!-- 手机号卡片 -->
      <div class="info-card">
        <div class="info-label">
          <el-icon class="label-icon"><Cellphone /></el-icon>
          手机号
        </div>
        <div class="info-value phone-value">{{ userInfo.phoneNumber }}</div>
      </div>

      <!-- 角色卡片 -->
      <div class="info-card">
        <div class="info-label">
          <el-icon class="label-icon"><Trophy /></el-icon>
          角色
        </div>
        <div class="info-value roles-value">
          <el-tag v-for="role in userInfo.roles" :key="role" class="role-tag" effect="light">
            {{ getRoleLabel(role) }}
          </el-tag>
        </div>
      </div>

      <!-- 访问地址卡片 -->
      <div class="info-card url-card">
        <div class="info-label">
          <el-icon class="label-icon"><Link /></el-icon>
          站内分享地址
        </div>
        <div class="info-value url-value">
          <div class="url-box">
            <el-icon class="url-icon"><Link /></el-icon>
            <span class="url-text">{{ profileUrl }}</span>
          </div>
          <el-button class="copy-btn" size="small" @click="copyProfileUrl">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
      </div>

      <!-- 更多信息展开区 -->
      <div class="source-section">
        <div class="source-toggle" @click="showSourceToggle = !showSourceToggle">
          <div class="info-label">
            <el-icon class="label-icon"><MoreFilled /></el-icon>
            更多信息
          </div>
          <el-icon class="toggle-icon" :class="{ expanded: showSourceToggle }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="expand">
          <div v-show="showSourceToggle" class="source-cards">
            <!-- 是否公开 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Star /></el-icon>
                是否公开数据
              </div>
              <div class="info-value">【开发中】</div>
            </div>
            <!-- 访问次数 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Star /></el-icon>
                被访问次数
              </div>
              <div class="info-value">【开发中】</div>
            </div>
            <!-- DB数据来源 -->
            <div class="info-card source-card">
              <div class="info-label">
                <el-icon class="label-icon"><DataLine /></el-icon>
                DB数据来源 (主要)
              </div>
              <div class="info-value source-value">
                <span>Bangumi 番组计划 </span>
                <a href="https://bangumi.tv/" target="_blank" class="source-link">
                  <el-icon><Link /></el-icon>
                  https://bangumi.tv/
                </a>
              </div>
            </div>
            <div class="info-card source-card">
              <div class="info-label">
                <el-icon class="label-icon"><DataLine /></el-icon>
                DB数据来源
              </div>
              <div class="info-value source-value">
                <span>The Movie Database </span>
                <a href="https://www.themoviedb.org/" target="_blank" class="source-link">
                  <el-icon><Link /></el-icon>
                  https://www.themoviedb.org/
                </a>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 底部联系邮箱按钮 -->
    <div class="contact-section">
      <el-button class="contact-btn" @click="copyContactEmail">
        <el-icon><Message /></el-icon>
        问题反馈
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  UserFilled,
  Edit,
  Check,
  Star,
  Cellphone,
  Trophy,
  Link,
  CopyDocument,
  MoreFilled,
  ArrowDown,
  DataLine,
  Message,
} from '@element-plus/icons-vue'
import { getRoleLabel } from '@/utils/enums/role'
import { useUserStore } from '@/store/modules/user'
import { modifyUserInfo } from '@/api/system/user'

interface UserInfo {
  userId: number
  userName: string
  nickName: string
  roles: string[]
  avatar: string
  phoneNumber: string
}

const props = defineProps<{
  userInfo: UserInfo
}>()

const emit = defineEmits<{
  'update-nickName': [nickName: string]
}>()

const userStore = useUserStore()

// 编辑状态
const editing = ref(false)
const submitting = ref(false)
const editForm = ref({
  nickName: '',
})

// 更多信息展开状态
const showSourceToggle = ref(false)

// 计算属性
const profileUrl = computed(() => {
  if (props.userInfo.userId == null) return ''
  const baseUrl = import.meta.env.VITE_ROOT_WEBSITE_URL
  return `${baseUrl}/${props.userInfo.userId}/visitor`
})

// 方法
const copyProfileUrl = async () => {
  await navigator.clipboard.writeText(profileUrl.value)
  ElNotification.success('链接已复制')
}

const copyContactEmail = async () => {
  await navigator.clipboard.writeText('2273554340@qq.com')
  ElNotification.success('邮箱地址已复制')
}

const startEditing = () => {
  editForm.value.nickName = props.userInfo.nickName
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await modifyUserInfo(editForm.value)
    emit('update-nickName', editForm.value.nickName)
    ElMessage.success('修改成功')
    editing.value = false
    userStore.loadUserInfo()
  } catch (error: any) {
    ElMessage.error('修改失败：' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
// ==================== 变量定义 ====================
$primary: #667eea;
$secondary: #764ba2;
$text-dark: #1a1a2e;
$text-muted: #6a6a8a;

// ==================== 主容器 ====================
.info-section {
  width: 100%;
}

// ==================== 标题区域 ====================
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba($primary, 0.15);
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: $text-dark;
  display: flex;
  align-items: center;
  gap: 10px;

  .section-icon {
    font-size: 24px;
    color: $primary;
  }
}

// 编辑按钮组
.header-actions {
  display: flex;
  gap: 10px;

  .edit-btn,
  .confirm-btn {
    background: linear-gradient(135deg, $primary, $secondary);
    &:hover {
      transform: translateY(-2px);
    }
  }
}

// ==================== 信息卡片公共样式 ====================
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 255, 0.7));
  border-radius: 14px;
  border: 1px solid rgba($primary, 0.15);
  transition: all 0.3s ease;

  // 左侧彩色边框
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, $primary, $secondary);
  }

  &:hover {
    transform: translateX(6px);
    border-color: rgba($primary, 0.3);
  }
}

.info-label {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 100px;
  font-size: 14px;
  font-weight: 600;
  color: $text-muted;

  .label-icon {
    font-size: 18px;
    color: $primary;
  }
}

.info-value {
  flex: 1;
  font-size: 15px;
  color: $text-dark;
  text-align: right;
}

// ==================== 特殊卡片样式 ====================
// 手机号 - 等宽字体
.phone-value {
  font-family: monospace;
  letter-spacing: 1px;
}

// 角色 - 标签组
.roles-value {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  .role-tag {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid rgba($primary, 0.3);
    background: linear-gradient(rgba($primary, 0.1), rgba($secondary, 0.1));
    color: $primary;
    font-weight: 600;
  }
}

// URL卡片
.url-card {
  .url-value {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
  }

  .url-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: linear-gradient(rgba($primary, 0.08), rgba($secondary, 0.08));
    border-radius: 10px;
    border: 1px solid rgba($primary, 0.15);
    max-width: 380px;
  }

  .url-text {
    font-family: monospace;
    color: #4a4a6a;
    font-size: 12px;
    word-break: break-all;
  }

  .copy-btn {
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    padding: 10px 18px;
    border-radius: 10px;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

// ==================== 更多信息展开区 ====================
.source-section {
  margin-top: 8px;
}

.source-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, rgba($primary, 0.08), rgba($secondary, 0.08));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));
    border-style: solid;
    border-color: rgba($primary, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary, 0.2);
  }

  .info-label {
    font-size: 13px;
    color: $primary;

    .label-icon {
      font-size: 16px;
    }
  }

  .toggle-icon {
    font-size: 14px;
    color: $primary;
    transition: transform 0.3s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

// 展开内容 - 轻量卡片样式
.source-cards {
  overflow: hidden;
  margin-left: 12px;

  .info-card {
    margin-top: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    border: 1px dashed rgba($primary, 0.2);

    &::before {
      display: none;
    }

    &:first-child {
      margin-top: 16px;
    }

    &:hover {
      transform: none;
      background: rgba(255, 255, 255, 0.7);
      border-style: solid;
    }

    .info-label {
      min-width: 80px;
      font-size: 13px;

      .label-icon {
        font-size: 16px;
      }
    }

    .info-value {
      font-size: 14px;
    }
  }
}

// 数据来源链接
.source-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(rgba($primary, 0.08), rgba($secondary, 0.08));
  border-radius: 10px;
  border: 1px solid rgba($primary, 0.15);
  color: $primary;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(rgba($primary, 0.15), rgba($secondary, 0.15));
    border-color: rgba($primary, 0.3);
    color: $secondary;
  }
}

// ==================== 展开/收起动画 ====================
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

// ==================== 底部按钮 ====================
.contact-section {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.contact-btn {
  background: linear-gradient(135deg, rgba($primary, 0.08), rgba($secondary, 0.08));
  border: 1px solid rgba($primary, 0.2);
  color: $primary;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));
    border-color: rgba($primary, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary, 0.2);
  }
}

// ==================== 编辑输入框 ====================
.edit-input {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba($primary, 0.15);
    padding: 8px 14px;
  }
}
</style>
