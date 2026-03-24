import store from '@/store'

/**
 * 从路由参数中获取目标用户 ID（通过 URL 路径解析）
 * @returns {string|null} 目标用户 ID，如果没有则返回 null
 */
export function getTargetUserId() {
  const path = window.location.pathname;
  // 匹配 /:userId/profile 格式的路径
  const match = path.match(/^\/([^/]+)\/profile$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * 获取目标用户 ID，如果路由中没有则返回当前登录用户的 ID
 * @param {Vue} vm Vue 实例 (this)
 * @returns {string} 目标用户 ID 或当前用户 ID
 */
export function getTargetUserIdOrDefault(vm) {
  return vm.$route.params.userid || store.getters.userId || 0;
}
