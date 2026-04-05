/**
 * 角色枚举
 * 对应后端 RoleEnum
 */
export enum RoleEnum {
  ADMIN = 0,
  MANAGER = 1,
  USER = 2,
}

/**
 * 角色中文映射（支持 code 和 name）
 */
export const RoleLabels: Record<string, string> = {
  // 数字 code 映射
  '0': '超级管理员',
  '1': '管理员',
  '2': '普通用户',
  // 字符串 name 映射
  admin: '超级管理员',
  manager: '管理员',
  user: '普通用户',
}

/**
 * 根据 code 或 name 获取角色中文名称
 * @param role 角色 code 或 name
 * @returns 角色中文名称
 */
export function getRoleLabel(role: number | string): string {
  return RoleLabels[String(role)] || '未知角色'
}
