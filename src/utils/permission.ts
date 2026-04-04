/**
 * 权限校验工具
 * 提供角色和权限的检查函数
 */

import { useUserStore } from '@/store/modules/user'

/**
 * 角色权限校验
 * @param requiredRoles 需要的角色列表
 * @returns 是否有任一所需角色
 */
export function checkRole(requiredRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    console.error('checkRole: 需要指定角色，例如 checkRole(["admin", "editor"])')
    return false
  }

  const userStore = useUserStore()
  const userRoles = userStore.roles

  // 检查是否有超级角色或所需角色
  return requiredRoles.some(role =>
    'admin' === role || userRoles.includes(role)
  )
}

/**
 * 字符权限校验
 * @param requiredPermissions 需要的权限列表
 * @returns 是否有任一所需权限（或拥有 *:*:* 超级权限）
 */
export function checkPermi(requiredPermissions: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.error('checkPermi: 需要指定权限，例如 checkPermi(["system:user:add", "system:user:edit"])')
    return false
  }

  const SUPER_PERMISSION = '*:*:*'
  const userStore = useUserStore()
  const userPermissions = userStore.permissions

  // 检查是否有超级权限或指定权限
  return requiredPermissions.some(perm =>
    perm === SUPER_PERMISSION || userPermissions.includes(perm)
  )
}
