<template>
  <!-- 头部 -->
  <div class="profile-header">
    <div class="header-left">
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>
    <h2 class="page-title">
      <el-icon class="title-icon"><User /></el-icon>
      个人中心
    </h2>
  </div>

  <!-- 头像区域 -->
  <div class="avatar-section">
    <div class="avatar-ring"></div>
    <div class="avatar-ring ring-2"></div>
    <el-upload action="#" :http-request="handleAvatarUpload" :show-file-list="false" accept="image/*">
      <div class="avatar-container">
        <el-avatar :src="userInfo.avatar" shape="circle" :size="130" fit="cover" class="main-avatar" />
        <div class="avatar-overlay">
          <el-icon :size="28"><Camera /></el-icon>
          <span>更换头像</span>
        </div>
      </div>
    </el-upload>
    <div class="avatar-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Camera } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { uploadAvatar } from '@/api/system/user'

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
  'avatar-uploaded': [avatarUrl: string]
}>()

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  router.back()
}

/**
 * 头像上传处理
 * @param options
 */
const handleAvatarUpload = async (options: { file: File }) => {
  const file = options.file

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('头像大小不能超过 10MB')
    return
  }

  try {
    const avatarUrl = await uploadAvatar(file)
    emit('avatar-uploaded', avatarUrl)
    ElMessage.success('头像上传成功')
    userStore.loadUserInfo()
  } catch (error: any) {
    ElMessage.error(error)
  }
}
</script>

<style scoped lang="scss">
// ==================== 变量定义 ====================
$primary: #667eea;
$secondary: #764ba2;
$accent: #f093fb;

// ==================== 头部区域 ====================
.profile-header {
  padding: 40px 24px;
  background: linear-gradient(135deg, $primary 0%, $secondary 50%, $accent 100%);
  background-size: 200% 200%;
  animation: gradientFlow 6s ease infinite;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-left {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
}

.back-btn {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-4px);
  }
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;

  .title-icon {
    font-size: 32px;
  }
}

// ==================== 头像区域 ====================
.avatar-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
}

// 旋转光环
.avatar-ring {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: rgba($primary, 0.6);
  border-right-color: rgba($secondary, 0.6);
  animation: ringRotate 3s linear infinite;

  &.ring-2 {
    width: 180px;
    height: 180px;
    border-top-color: rgba($accent, 0.4);
    border-right-color: rgba($primary, 0.4);
    animation-duration: 5s;
    animation-direction: reverse;
  }
}

// 头像容器
.avatar-container {
  position: relative;
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 10;

  &:hover {
    transform: scale(1.05);
    .avatar-overlay {
      opacity: 1;
    }
  }
}

.main-avatar {
  box-shadow: 0 4px 20px rgba($primary, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

// 头像上传遮罩
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba($primary, 0.85), rgba($secondary, 0.85));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;

  span {
    font-size: 12px;
  }
}

// 底部光晕
.avatar-glow {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($primary, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  z-index: 0;
  animation: glowPulse 3s ease-in-out infinite;
}

// ==================== 动画定义 ====================
@keyframes gradientFlow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes ringRotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>
