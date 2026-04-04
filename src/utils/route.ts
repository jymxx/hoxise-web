/**
 * 路由工具函数
 * 负责从 store 中获取访问者用户 ID
 */

import { useMovieStore } from '@/store/modules/movie'
import { useUserStore } from '@/store/modules/user'

/**
 * 获取查询目标数据用户id
 *
 * 访问用户 -> 登录用户 -> 默认用户
 *
 * 从 movie store 中读取 accessUserid
 * @returns 用户 ID
 */
export function getTargetUserid(): string {
  return useMovieStore().accessUserid || useUserStore().id || '0'
}
