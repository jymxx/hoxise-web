/**
 * 自定义指令入口
 * 用于注册全局自定义指令
 */

import type { App } from 'vue'
import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'

/**
 * 注册全局自定义指令
 * @param app Vue 应用实例
 */
export function setupDirectives(app: App) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
}

export default setupDirectives
