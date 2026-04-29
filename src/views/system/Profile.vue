<template>
  <div class="profile-container">
    <div class="profile-card">
      <!-- 头部 + 头像模块 -->
      <ProfileHeader :user-info="userInfo" @avatar-uploaded="handleAvatarUploaded" />

      <div class="profile-content">
        <!-- 基本信息模块 -->
        <ProfileInfo :user-info="userInfo" @update-nickName="handleNickNameUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/system/user'
import ProfileHeader from './profile/ProfileHeader.vue'
import ProfileInfo from './profile/ProfileInfo.vue'

interface UserInfo {
  userId: number
  userName: string
  nickName: string
  roles: string[]
  avatar: string
  phoneNumber: string
}

const userInfo = ref<UserInfo>({} as UserInfo)

/**
 * 加载用户信息
 */
const loadUserInfo = async () => {
  try {
    userInfo.value = await getUserInfo()
  } catch (error) {
    ElMessage.error('加载用户信息失败：' + error)
  }
}

/**
 * 头像上传成功回调
 * @param avatarUrl 头像地址
 */
const handleAvatarUploaded = (avatarUrl: string) => {
  userInfo.value.avatar = avatarUrl
}

/**
 * 处理昵称更新
 * @param nickName 新昵称
 */
const handleNickNameUpdate = (nickName: string) => {
  userInfo.value.nickName = nickName
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
.profile-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0f0f2d 100%);
  padding: 24px;
  overflow: hidden;

  .profile-card {
    position: relative;
    z-index: 10;
    max-width: 700px;
    margin: 30px auto;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 0.95));
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: cardFadeIn 0.6s ease;

    .profile-content {
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
